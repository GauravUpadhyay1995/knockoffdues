// app/api/reminders/[reminderId]/[paymentId]/[paySlipId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Reminder } from "@/models/Reminder";
import { verifyAdmin } from "@/lib/verifyAdmin";

export const PATCH = verifyAdmin(
    asyncHandler(
        async (
            req: NextRequest,
            { params }: { params: { vendorId: string; paymentId: string; paySlipId: string } }
        ) => {
            await connectToDB();

            const { vendorId, paymentId, paySlipId } = params;

            if (!vendorId || !paymentId || !paySlipId) {
                return NextResponse.json(
                    {
                        success: false,
                        message: !vendorId
                            ? "Reminder ID is required"
                            : !paymentId
                                ? "Payment ID is required"
                                : "PaySlip ID is required",
                    },
                    { status: 400 }
                );
            }

            // Check if reminder exists
            const existingReminder = await Reminder.findById(vendorId);
            if (!existingReminder) {
                return NextResponse.json(
                    { success: false, message: "Reminder not found" },
                    { status: 404 }
                );
            }

            // Remove the slip
            const updatedReminder = await Reminder.updateOne(
                {
                    _id: vendorId,
                    "payment._id": paymentId,
                },
                {
                    $pull: {
                        "payment.$.slip": { _id: paySlipId },
                    },
                }
            );

            if (updatedReminder.modifiedCount === 0) {
                return NextResponse.json(
                    { success: false, message: "No slip removed" },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Pay slip removed successfully",
                data: updatedReminder,
            });
        }
    )
);
