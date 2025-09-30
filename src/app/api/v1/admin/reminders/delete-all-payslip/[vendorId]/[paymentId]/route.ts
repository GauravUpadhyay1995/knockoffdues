
// app/api/reminders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Reminder } from "@/models/Reminder";
import { uploadBufferToS3 } from "@/lib/uploadToS3";
import { createReminderSchema } from "@/lib/validations/reminder.schema";
import { verifyAdmin } from "@/lib/verifyAdmin";
export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { vendorId: string, paymentId: string } }) => {
        await connectToDB();

        const { vendorId, paymentId } = params;

        if (!vendorId || !paymentId) {
            let msg = "";
            if (!vendorId) {
                msg = "Reminder ID is required";
            }
            if (!paymentId) {
                msg = "Payment ID is required";
            }
            return NextResponse.json(
                {
                    success: false,
                    message: msg,
                },
                { status: 400 }
            );
        }

        // Check if reminder exists
        const existingReminder = await Reminder.findById(vendorId);
        if (!existingReminder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reminder not found",
                },
                { status: 404 }
            );
        }


        // Update the reminder
        // const updatedReminder = await Reminder.updateOne(
        //     {
        //         _id: vendorId,
        //         "payment._id": paymentId
        //     },
        //     {
        //         $set: { "payment.$.slip": [] }   // set slip array to empty
        //     }
        // );
        const updatedReminder = await Reminder.updateOne(
            {
                _id: vendorId
            },
            {
                $pull: {
                    payment: { _id: paymentId } // removes the payment object itself
                }
            }
        );


        if (!updatedReminder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to update reminder",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Reminder updated successfully",
            data: updatedReminder,
        });
    })
);