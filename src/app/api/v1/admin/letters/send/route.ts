import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { verifyAdmin } from '@/lib/verifyAdmin';
import puppeteer from 'puppeteer';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { updateLetterRecords } from '@/lib/updateLetterRecords'; // optional helper
import { User } from "@/models/User"; // assuming you store letter records in MongoDB
import { sendLetterEmail } from '@/lib/sendMail';
import { MailConfig } from "@/models/MailConfig";

import { sendBulkEmail } from "@/lib/sendMail";
export const POST = verifyAdmin(
    asyncHandler(async (req: NextRequest) => {
        await connectToDB();
        const { userData, letter } = await req.json();
        let employeeData = [userData];
        let subject = '';
        let body = '';
        if (!userData || !letter) {
            return NextResponse.json(
                { success: false, message: "User ID and letter data are required" },
                { status: 400 }
            );
        }
        const settings = await MailConfig.findOne().sort({ createdAt: -1 }).lean();
        if (!settings) {
            return NextResponse.json({ success: false, message: 'No Mail Settings Found' });
        }
        if (!settings?.joining_email_template.allowed && letter.letterType === "joining") {
            return NextResponse.json({ success: false, message: 'Mail Configuration is Off' });
        }
        if (!settings?.experience_email_template.allowed && letter.letterType === "experience") {
            return NextResponse.json({ success: false, message: 'Mail Configuration is Off' });
        }


        if (letter.letterType === "joining") {
            body = settings?.joining_email_template.body;
            subject = settings?.joining_email_template.subject;
        } else if (letter.letterType === "experience") {
            body = settings?.experience_email_template.body;
            subject = settings?.experience_email_template.subject;
        }
        const result = await sendBulkEmail({ employeeData, subject, body });

        // await sendLetterEmail({
        //     to: userData.email,
        //     letterType: letter.letterType,
        //     userData,
        //     letterUrl: letter.url,
        // });

        const updatedUser = await User.updateOne(
            { _id: userData._id, "letters._id": letter._id },
            {
                $set: { "letters.$.isSent": true },
            }
        );

        return NextResponse.json({ success: true, message: 'Letter sent successfully!' });
    })
);
