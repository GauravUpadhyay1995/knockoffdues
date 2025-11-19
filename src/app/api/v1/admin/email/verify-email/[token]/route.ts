import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { User } from "@/models/User";

export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    await connectToDB();

    const token = params.token;
    console.log("Verifying token:", token);

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Token missing" },
            { status: 400 }
        );
    }

    // Find user with matching token and not expired
    const user = await User.findOne({
        emailVerificationLink: token,
        emailVerificationLinkExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Invalid or expired verification link" },
            { status: 400 }
        );
    }

    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                isEmailVerified: true,
            },
            $unset: {
                emailVerificationLink: null,
                emailVerificationLinkExpiry: null,
            },
        }
    );


    return NextResponse.json({
        success: true,
        message: "Email verified successfully",
    });
}
