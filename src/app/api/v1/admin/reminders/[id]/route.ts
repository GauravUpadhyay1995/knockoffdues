
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Reminder } from "@/models/Reminder";
import { verifyAdmin } from "@/lib/verifyAdmin";
export const GET = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reminder ID is required",
                },
                { status: 400 }
            );
        }

        const reminder = await Reminder.findById(id).lean();

        if (!reminder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reminder not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: reminder,
        });
    })
);
