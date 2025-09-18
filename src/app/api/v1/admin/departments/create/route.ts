import { NextRequest, NextResponse } from "next/server";
import { createDepartmentSchema } from "@/lib/validations/department.schema";
import { asyncHandler } from "@/lib/asyncHandler";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { connectToDB } from "@/config/mongo";
import { Department } from "@/models/Department";

type CreateDepartmentBody = {
  department: string;
  isActive?: boolean;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    let body = await req.json();

    // Transform array of strings into array of objects if needed
    if (Array.isArray(body) && body.every((item) => typeof item === "string")) {
      body = body.map((department) => ({ department }));
    }

    // Normalize into array for consistent processing
    const departments: CreateDepartmentBody[] = Array.isArray(body) ? body : [body];

    // Validate each department
    const validationErrors: { index: number; errors: Record<string, string> }[] = [];
    const validDepartments: CreateDepartmentBody[] = [];

    departments.forEach((dept, idx) => {
      const { error, value } = createDepartmentSchema.validate(dept, {
        abortEarly: false,
      });

      if (error) {
        validationErrors.push({
          index: idx,
          errors: Object.fromEntries(error.details.map((d) => [d.path.join("."), d.message])),
        });
      } else {
        validDepartments.push(value);
      }
    });

    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors); // Debug: Log validation errors
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Service call
    const creationResult = await createDepartments(validDepartments);

    return NextResponse.json(
      {
        success: creationResult.success,
        message: creationResult.message,
        data: creationResult.data,
        errors: creationResult.errors,
      },
      { status: creationResult.status }
    );
  })
);

// --- Service Layer ---
export const createDepartments = async (departments: CreateDepartmentBody[]) => {
  try {
    await connectToDB();

    // Normalize names to lowercase
    const deptNames = departments.map((d) => d.department.trim().toLowerCase());

    // Find duplicates in DB
    const existingDepts = await Department.find({
      department: { $in: deptNames },
    }).lean();

    const existingNames = new Set(existingDepts.map((d) => d.department.toLowerCase()));

    // Filter out new ones
    const newDepartments = departments.filter(
      (d) => !existingNames.has(d.department.trim().toLowerCase())
    );

    if (newDepartments.length === 0) {
      return {
        status: 409,
        success: false,
        message: "provided departments already exist",
        data: [],
        errors: Array.from(existingNames),
      };
    }

    // Insert new departments
    const result = await Department.insertMany(
      newDepartments.map((d) => ({
        department: d.department.trim().toLowerCase(),
        isActive: d.isActive ?? true,
      }))
    );

    return {
      status: 200,
      success: true,
      message: `Departments added successfully. Skipped ${
        departments.length - newDepartments.length
      } duplicate(s).`,
      data: result,
      errors: Array.from(existingNames),
    };
  } catch (error: any) {
    console.error("Department creation failed:", error);
    const formatted = formatMongooseError(error);
    return {
      status: 400,
      success: false,
      message: formatted.message,
      errors: formatted.errors,
      data: null,
    };
  }
};

function formatMongooseError(error: any) {
  return {
    message: error.message || "An error occurred",
    errors: error.errors || {},
  };
}
