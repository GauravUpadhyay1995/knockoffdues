import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { MailConfig } from "@/models/MailConfig";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { sendBulkEmail } from "@/lib/sendMail";
import crypto from "crypto";

export const POST = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    try {
        // Read body (for selected users)
        const { token } = await req.json().catch(() => ({ token: null }));
        let employeeData = [];

        employeeData = await User.find({
            emailVerificationLink: token
        }).lean();

        if (employeeData.length === 0) {
            return NextResponse.json(
                { success: false, message: "No valid users found" },
                { status: 400 }
            );
        }

        // Get email settings
        const settings = await MailConfig.findOne().sort({ createdAt: -1 }).lean();

        const templateMap = {
            registration_email_template: settings?.registration_email_template,
        };

        const template = templateMap['registration_email_template'];

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

        // Generate random token
        const newToken = crypto.randomBytes(32).toString("hex");
        const expTime = Date.now() + 24 * 60 * 60 * 1000;

        const updatedUsers = await Promise.all(
            employeeData.map(async (user) => {
                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    {
                        $set: {
                            emailVerificationLink: newToken,
                            emailVerificationLinkExpiry: expTime,
                        },
                    },
                    {
                        new: true, // Return the updated document
                        runValidators: true // Run schema validators
                    }
                );
                return updatedUser;
            })
        );


        console.log("Updated Users Data:", updatedUsers);

        // Queue messages into SQS
        const result = await sendBulkEmail({
            employeeData: updatedUsers,
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
});