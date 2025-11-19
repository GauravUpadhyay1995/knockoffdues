import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { MailConfig } from "@/models/MailConfig";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { sendBulkEmail } from "@/lib/sendMail";
import crypto from "crypto";

export const POST = verifyAdmin(
    asyncHandler(async (req: NextRequest) => {
        await connectToDB();

        try {
            // Read body (for selected users)
            const { userIds, type } = await req.json().catch(() => ({ userIds: null }));

            // Get email settings
            const settings = await MailConfig.findOne().sort({ createdAt: -1 }).lean();


            const templateMap = {
                bulk_email_template: settings?.bulk_email_template,
                registration_email_template: settings?.registration_email_template,
                warning_email_template: settings?.warning_email_template,
            };

            const template = templateMap[type];

            if (!template) {
                return NextResponse.json(
                    { success: false, message: "Invalid email type" },
                    { status: 400 }
                );
            }

            const { allowed, subject, body } = template;


            if (!allowed || !subject || !body) {
                return NextResponse.json(
                    { success: false, message: "Bulk email settings missing" },
                    { status: 400 }
                );
            }

            let employeeData = [];

            // ==========================================
            // CASE 1: SEND TO SELECTED USERS ONLY
            // ==========================================
            if (Array.isArray(userIds) && userIds.length > 0) {
                employeeData = await User.find({
                    _id: { $in: userIds },
                    isActive: true,
                    isVerified: true,
                    isEmailVerified: true,
                })
                    .populate("department", "department")
                    .lean();

                if (employeeData.length === 0) {
                    return NextResponse.json(
                        { success: false, message: "No valid users found" },
                        { status: 400 }
                    );
                }
            } else {
                // ==========================================
                // CASE 2: SEND TO ALL USERS (default)
                // ==========================================
                employeeData = await User.find({
                    isActive: true,
                    isVerified: true,
                    isEmailVerified: true,
                    role: { $ne: "lead" },
                })
                    .populate("department", "department")
                    .sort({ createdAt: -1 })
                    .lean();
            }

            // Queue messages into SQS
            const result = await sendBulkEmail({
                employeeData,
                subject,
                body,
            });

            return NextResponse.json({
                success: true,
                message: "Emails queued successfully",
                count: employeeData.length,
                data: result,
            });
        } catch (error) {
            console.error("❌ API ERROR:", error);
            return NextResponse.json(
                { success: false, message: "Failed to queue emails" },
                { status: 500 }
            );
        }
    })
);


