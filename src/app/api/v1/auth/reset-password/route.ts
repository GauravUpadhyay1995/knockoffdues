import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from "@/models/User"; // assuming you store letter records in MongoDB
import { sendLetterEmail } from '@/lib/sendMail';

export const POST = asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const { email, action, otp, newPassword } = await req.json();

    if (!email || !action) {
        return NextResponse.json(
            { success: false, message: "Email ID and action  are required" },
            { status: 400 }
        );
    }

    const userData = await User.findOne({ email });
    if (!userData) {
        return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
        );
    }
    if (action == 'send_otp') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes    

        await User.updateOne(
            { email },
            {
                $set: {
                    otp,
                    otpExpiry
                }
            }
        );


        await sendLetterEmail({
            to: userData.email,
            letterType: "password_reset_otp",
            userData,
            letterUrl: otp,
        });
        return NextResponse.json({ success: true, message: 'Link sent successfully!' });

    }
    else if (action == 'verify_otp') {
        if (!otp) {
            return NextResponse.json(
                { success: false, message: "OTP is required for verification" },
                { status: 400 }
            );
        }
        if (userData.otp !== otp || new Date() > userData.otpExpiry) {

            return NextResponse.json(
                { success: false, message: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, message: 'Otp Validated successfully!' });

    }
    else if (action == 'reset_password') {
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required for verification" },
                { status: 400 }
            );
        }
        if (!otp) {
            return NextResponse.json(
                { success: false, message: "OTP is required for verification" },
                { status: 400 }
            );
        }
        if (userData.otp !== otp || new Date() > userData.otpExpiry) {

            return NextResponse.json(
                { success: false, message: "Invalid or expired OTP" },
                { status: 400 }
            );
        }
        // Clear OTP after successful verification
        const hashedPassword = await bcrypt.hash(newPassword, 10);


        await User.updateOne(
            { email },
            {
                $set: {
                    otp: null,
                    otpExpiry: null,
                    password: hashedPassword

                }
            }
        );
        return NextResponse.json({ success: true, message: 'Password Updated successfully!' });

    }
    else {
        return NextResponse.json(
            { success: false, message: "Invalid action" },
            { status: 400 }
        );
    }







});

