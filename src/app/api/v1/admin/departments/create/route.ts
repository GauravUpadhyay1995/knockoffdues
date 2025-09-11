
import { NextRequest, NextResponse } from 'next/server';
import { createDepartmentSchema } from '@/lib/validations/department.schema';
import { asyncHandler } from '@/lib/asyncHandler';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { connectToDB } from '@/config/mongo';
import { Department } from '@/models/Department';

type CreateDepartmentBody = {
    department: string;
    isActive: boolean;

};



export const POST = verifyAdmin(asyncHandler(async (req: NextRequest) => {
    await connectToDB();


    const body = await req.json();
    const { error, value } = createDepartmentSchema.validate(body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.reduce((acc, curr) => {
            acc[curr.path[0] as string] = curr.message;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(
            {
                success: false,
                message: 'Validation failed',
                errors: errorMessages,
                data: null,
            },
            { status: 400 }
        );
    }
    const creationResult = await createDepartment(body);
    console.log("creationResult", creationResult)


    return NextResponse.json({
        success: creationResult.success,
        message: creationResult.message,
        data: creationResult.data,
    },
        { status: creationResult.status });
}));

export const createDepartment = async (body: CreateDepartmentBody) => {
    try {
        const { department, isActive } = body;
        await connectToDB();
       const existingDept = await Department.findOne({ department });


        if (existingDept) {
            return {
                status: 409,
                success: false,
                message: 'Department already exists',
                data: null
            };
        }

     

        const departmentToSave = new Department({
          
           department
        });

        const result = await departmentToSave.save();
        const departmentObj = result.toObject();
        return {
            status: 200,
            success: true,
            message: 'Department Registered',
            data: departmentObj
        };
    } catch (error: any) {
        console.error("Department creation failed:", error);
        const formatted = formatMongooseError(error);
        return {
            status: 400,
            success: false,
            message: formatted.message,
            errors: formatted.errors,
            data: null
        };
    }
};

function generateSecurePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const specialChars = '!@#$%^&*';
    const password = Array.from({ length: length - 2 }, () =>
        chars[Math.floor(Math.random() * chars.length)]).join('');
    return password +
        specialChars[Math.floor(Math.random() * specialChars.length)] +
        chars[Math.floor(Math.random() * chars.length)];
}

function formatMongooseError(error: any) {
    // Basic implementation: extract message and errors from Mongoose error object
    return {
        message: error.message || 'An error occurred',
        errors: error.errors || {},
    };
}
