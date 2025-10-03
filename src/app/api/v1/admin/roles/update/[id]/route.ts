import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Role } from '@/models/Role';
import { createRoleSchema } from '@/lib/validations/role.schema';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { sendResponse } from '@/lib/sendResponse';

export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();

        const { id } = params;
        const body = await req.json();


        // 2. Validate request body against schema
        const { error, value } = createRoleSchema.validate(body, { abortEarly: false });

        if (error) {
            const errors = Object.fromEntries(error.details.map(d => [d.path[0], d.message]));
            return sendResponse({ success: false, statusCode: 400, message: 'Validation failed', errors });
        }

        // 3. Prevent empty updates
        if (Object.keys(value).length === 0) {
            return sendResponse({
                success: false,
                statusCode: 400,
                message: 'No valid fields provided for update.',
            });
        }

        // 4. Handle a potential role name conflict
        if (value.role) {
            const existingDepartment = await Role.findOne({
                role: value.role.toLowerCase(),
                _id: { $ne: id },
            });
            if (existingDepartment) {
                return sendResponse({
                    success: false,
                    statusCode: 409,
                    message: 'Role with this name already exists.',
                });
            }
        }

        // 5. Atomic update and return the document
        const updatedRole = await Role.findByIdAndUpdate(
            id,
            { ...value, role: value.role.trim().toLowerCase(), updatedBy: (req as any).user.id }, // Add updater ID
            { new: true, runValidators: true, timestamps: true, lean: true }
        );

        if (!updatedRole) {
            return sendResponse({ success: false, statusCode: 404, message: 'Role not found.' });
        }

        return sendResponse({
            success: true,
            statusCode: 200,
            message: 'Role updated successfully.',
            data: updatedRole,
        });
    })
);