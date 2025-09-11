
import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/lib/validations/user.schema';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { connectToDB } from '@/config/mongo';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

type CreateUserBody = {
    name: string;
    email: string;
    role: string;
    password: string;
    mobile: string;
    permissions?: {
        module: string;
        actions: string[];
    }[];
};



export const POST = (asyncHandler(async (req: NextRequest) => {
    await connectToDB();


    const body = await req.json();
    const { error, value } = createUserSchema.validate(body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.reduce((acc, curr) => {
            acc[curr.path[0] as string] = curr.message;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(
            {
                success: false,
                message: 'Validation failed',
                errors: errorMessages,
                data: null,
            },
            { status: 400 }
        );
    }
    const creationResult = await createUser(body);
    console.log("creationResult", creationResult)


    return NextResponse.json({
        success: creationResult.success,
        message: creationResult.message,
        data: creationResult.data,
    },
        { status: creationResult.status });
}));

export const createUser = async (body: CreateUserBody) => {
    try {
        const { name, email, role, password, mobile } = body;
        await connectToDB();
        const existingUser = await User.findOne({
            $or: [{ email }, { mobile }]
        });

        if (existingUser) {
            return {
                status: 409,
                success: false,
                message: 'User already exists',
                data: null
            };
        }

        const rawPassword = password || generateSecurePassword();
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            mobile,
        });

        const result = await user.save();
        const userObj = result.toObject();
        delete userObj.password;
        return {
            status: 200,
            success: true,
            message: 'User Registered',
            data: userObj
        };
    } catch (error: any) {
        console.error("User creation failed:", error);
        const formatted = formatMongooseError(error);
        return {
            status: 400,
            success: false,
            message: formatted.message,
            errors: formatted.errors,
            data: null
        };
    }
};

function generateSecurePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const specialChars = '!@#$%^&*';
    const password = Array.from({ length: length - 2 }, () =>
        chars[Math.floor(Math.random() * chars.length)]).join('');
    return password +
        specialChars[Math.floor(Math.random() * specialChars.length)] +
        chars[Math.floor(Math.random() * chars.length)];
}

function formatMongooseError(error: any) {
    // Basic implementation: extract message and errors from Mongoose error object
    return {
        message: error.message || 'An error occurred',
        errors: error.errors || {},
    };
}
