import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Department } from '@/models/Department';

import { asyncHandler } from '@/lib/asyncHandler';

export const GET =   asyncHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const { id: departmentID } = params || {};

    if (!departmentID?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Department ID is missing in route' },
        { status: 400 }
      );
    }

    const departmentData = await Department.findById(departmentID).lean();

    if (!departmentData) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Department fetched successfully',
      data: departmentData,
    });
  })