import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { MailConfig } from "@/models/MailConfig";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { sendBulkEmail } from "@/lib/sendMail";
export const POST = verifyAdmin(
    asyncHandler(async (req: NextRequest) => {
        await connectToDB();
        const user = (req as any).user;

        try {
            const settings = await MailConfig.findOne().sort({ createdAt: -1 }).lean();

            const { allowed, subject, body } = settings?.bulk_email_template || {};

            if (!allowed || !subject || !body) {
                return NextResponse.json(
                    { success: false, message: "Bulk email settings missing" },
                    { status: 400 }
                );
            }

            const employeeData = await User.find({
                isActive: true,
                isVerified: true,
                isEmailVerified: true,
                role: { $ne: "lead" },
            })
                .populate("department", "department")
                .sort({ createdAt: -1 })
                .lean();

            const result = await sendBulkEmail({
                employeeData,
                subject,
                body,
            });

            return NextResponse.json({
                success: true,
                message: "Emails queued successfully",
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




