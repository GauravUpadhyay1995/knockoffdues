import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Department } from '@/models/Department';
import { createDepartmentSchema } from '@/lib/validations/department.schema';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { sendResponse } from '@/lib/sendResponse';

export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();
        
        const { id } = params;
        const body = await req.json();

        // 1. Validate ID and prevent updates to a specific department
        if (!id || !mongoose.Types.ObjectId.isValid(id) || id === '68c010a2724b71204da764cf') {
            return sendResponse({
                success: false,
                statusCode: 400,
                message: 'Invalid or immutable department ID.',
            });
        }

        // 2. Validate request body against schema
        const { error, value } = createDepartmentSchema.validate(body, { abortEarly: false });

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
        
        // 4. Handle a potential department name conflict
        if (value.department) {
            const existingDepartment = await Department.findOne({
                department: value.department.toLowerCase(),
                _id: { $ne: id },
            });
            if (existingDepartment) {
                return sendResponse({
                    success: false,
                    statusCode: 409,
                    message: 'Department with this name already exists.',
                });
            }
        }
        
        // 5. Atomic update and return the document
        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            { ...value, updatedBy: (req as any).user.id }, // Add updater ID
            { new: true, runValidators: true, timestamps: true, lean: true }
        );

        if (!updatedDepartment) {
            return sendResponse({ success: false, statusCode: 404, message: 'Department not found.' });
        }

        return sendResponse({
            success: true,
            statusCode: 200,
            message: 'Department updated successfully.',
            data: updatedDepartment,
        });
    })
);