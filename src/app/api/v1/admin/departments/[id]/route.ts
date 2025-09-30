import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/config/mongo';
import { Department } from '@/models/Department';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';

export const GET = asyncHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const { id } = params;

    // 1. Validate ObjectId early for security and efficiency
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return sendResponse({
            success: false,
            statusCode: 400,
            message: 'Invalid or missing department ID',
        });
    }

    // 2. Optimized findById with lean()
    const departmentData = await Department.findById(id).lean();

    // 3. Handle not found case
    if (!departmentData) {
        return sendResponse({
            success: false,
            statusCode: 404,
            message: 'Department not found',
        });
    }

    // 4. Return success response
    return sendResponse({
        success: true,
        statusCode: 200,
        message: 'Department fetched successfully',
        data: departmentData,
    });
});