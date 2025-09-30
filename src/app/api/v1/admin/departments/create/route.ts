import { NextRequest, NextResponse } from "next/server";
import { createDepartmentSchema } from "@/lib/validations/department.schema";
import { asyncHandler } from "@/lib/asyncHandler";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { connectToDB } from "@/config/mongo";
import { Department } from "@/models/Department";
import { sendResponse } from '@/lib/sendResponse';

type CreateDepartmentBody = {
  department: string;
  isActive?: boolean;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const body = await req.json();
    let departmentsToCreate: CreateDepartmentBody[];

    // Normalize input to an array of objects
    if (Array.isArray(body)) {
      departmentsToCreate = body.map(item => typeof item === "string" ? { department: item } : item as CreateDepartmentBody);
    } else {
      departmentsToCreate = [body as CreateDepartmentBody];
    }
    
    // Validate all departments and collect errors and valid data in a single pass
    const validationResults = departmentsToCreate.map((dept, index) => {
      const { error, value } = createDepartmentSchema.validate(dept, { abortEarly: false });
      return { index, error, value };
    });

    const validationErrors = validationResults.filter(res => res.error).map(err => ({
      index: err.index,
      errors: Object.fromEntries(err.error!.details.map(d => [d.path.join("."), d.message])),
    }));

    if (validationErrors.length > 0) {
      return sendResponse({
        success: false,
        statusCode: 400,
        message: "Validation failed for some departments",
        errors: validationErrors,
      });
    }
    
    // Extract and normalize names of valid departments
    const validDepartments = validationResults.map(res => ({
      ...res.value,
      department: res.value.department.trim().toLowerCase(),
    }));

    try {
      // Find existing departments and filter out new ones
      const existingDepartments = await Department.find({
        department: { $in: validDepartments.map(d => d.department) },
      }).lean();

      const existingNames = new Set(existingDepartments.map(d => d.department));

      const newDepartments = validDepartments.filter(d => !existingNames.has(d.department));
      
      if (newDepartments.length === 0) {
        return sendResponse({
          success: false,
          statusCode: 409,
          message: "All provided departments already exist",
          errors: Array.from(existingNames),
        });
      }

      const result = await Department.insertMany(newDepartments);
      const skippedCount = departmentsToCreate.length - newDepartments.length;

      return sendResponse({
        success: true,
        statusCode: 201,
        message: `Departments added successfully. Skipped ${skippedCount} duplicate(s).`,
        data: result,
        errors: skippedCount > 0 ? Array.from(existingNames) : undefined,
      });

    } catch (error: any) {
      console.error("Department creation failed:", error);
      return sendResponse({
        success: false,
        statusCode: 500,
        message: "Failed to create departments",
        errors: error.message || "An unexpected error occurred",
      });
    }
  })
);