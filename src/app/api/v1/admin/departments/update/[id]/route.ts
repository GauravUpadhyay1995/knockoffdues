import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Department } from '@/models/Department';
import { createDepartmentSchema } from '@/lib/validations/department.schema';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();
        const user = (req as any).user;
        const departmentID = params.id;
        if (departmentID == '68c010a2724b71204da764cf') {
            return NextResponse.json({
                success: false,
                message: 'Default Department Cant Be Change',
            }, { status: 400 });
        }
        const rawBody = await req.json();

        const { error, value } = createDepartmentSchema.validate(rawBody, { abortEarly: false });

        if (error) {
            const errors = Object.fromEntries(error.details.map(d => [d.path[0], d.message]));
            return NextResponse.json({ success: false, message: 'Validation failed', errors }, { status: 400 });
        }



        if (Object.keys(rawBody).length <= 1) {
            return NextResponse.json({
                success: false,
                message: 'No valid fields provided for update',
            }, { status: 400 });
        }
        const existingDepartment = await Department.findOne({
            department: rawBody.department.toLowerCase(), // ✅ corrected
            _id: { $ne: departmentID },                  // ✅ exclude current ID
        });

        if (existingDepartment) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Department already exists',
                },
                { status: 409 }
            );
        }

        const updatedDepartment = await Department.findByIdAndUpdate(departmentID, { $set: rawBody }, { new: true });

        if (!updatedDepartment) {
            return NextResponse.json({ success: false, message: 'Department not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Department updated successfully',
            data: updatedDepartment.toObject(),
        });
    })
);
