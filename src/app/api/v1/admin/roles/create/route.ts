import { NextRequest, NextResponse } from "next/server";
import { createRoleSchema } from "@/lib/validations/role.schema";
import { asyncHandler } from "@/lib/asyncHandler";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { connectToDB } from "@/config/mongo";
import { Role } from "@/models/Role";
import { sendResponse } from '@/lib/sendResponse';

type CreateRoleBody = {
    role: string;
    isActive?: boolean;
};

export const POST = verifyAdmin(
    asyncHandler(async (req: NextRequest) => {
        await connectToDB();
        const user = (req as any).user; // ✅ coming from verifyAdmin middleware
        const body = await req.json();
        let rolesToCreate: CreateRoleBody[];
        // Normalize input to array of objects
        if (Array.isArray(body)) {
            rolesToCreate = body.map(item =>
                typeof item === "string" ? { role: item } : (item as CreateRoleBody)
            );
        } else {
            rolesToCreate = [body as CreateRoleBody];
        }

        // Validate roles
        const validationResults = rolesToCreate.map((roll, index) => {
            const { error, value } = createRoleSchema.validate(roll, { abortEarly: false });
            return { index, error, value };
        });

        const validationErrors = validationResults
            .filter(res => res.error)
            .map(err => ({
                index: err.index,
                errors: Object.fromEntries(
                    err.error!.details.map(d => [d.path.join("."), d.message])
                ),
            }));

        if (validationErrors.length > 0) {
            return sendResponse({
                success: false,
                statusCode: 400,
                message: "Validation failed for some roles",
                errors: validationErrors,
            });
        }

        // Normalize role names
        const validRoles = validationResults.map(res => ({
            ...res.value,
            role: res.value.role.trim().toLowerCase(),
            createdBy: user.id, // ✅ Add creator ID
        }));

        try {
            // Find existing roles
            const existingRoles = await Role.find({
                role: { $in: validRoles.map(d => d.role) },
            }).lean();

            const existingNames = new Set(existingRoles.map(d => d.role));

            const newRoles = validRoles.filter(d => !existingNames.has(d.role));

            if (newRoles.length === 0) {
                return sendResponse({
                    success: false,
                    statusCode: 409,
                    message: "All provided roles already exist",
                    errors: Array.from(existingNames),
                });
            }

            // ✅ Insert with createdBy field
            const result = await Role.insertMany(newRoles);
            const skippedCount = rolesToCreate.length - newRoles.length;

            return sendResponse({
                success: true,
                statusCode: 201,
                message: `Roles added successfully. Skipped ${skippedCount} duplicate(s).`,
                data: result,
                errors: skippedCount > 0 ? Array.from(existingNames) : undefined,
            });

        } catch (error: any) {
            console.error("Role creation failed:", error);
            return sendResponse({
                success: false,
                statusCode: 500,
                message: "Failed to create roles",
                errors: error.message || "An unexpected error occurred",
            });
        }
    })
);
