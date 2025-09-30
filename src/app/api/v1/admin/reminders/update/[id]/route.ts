// app/api/reminders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Reminder } from "@/models/Reminder";
import { uploadBufferToS3 } from "@/lib/uploadToS3";
import { createReminderSchema } from "@/lib/validations/reminder.schema";
import { verifyAdmin } from "@/lib/verifyAdmin";

// Helper function to validate update data (similar to create but with optional fields)
const updateReminderSchema = createReminderSchema.fork(
    ['vendorName', 'billingDate', 'amount', 'senderReceiver'],
    (schema) => schema.optional()
);


// UPDATE reminder by ID
export const PUT = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();

        const { id } = params;
        const user = (req as any).user;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reminder ID is required",
                },
                { status: 400 }
            );
        }

        // Check if reminder exists
        const existingReminder = await Reminder.findById(id);
        if (!existingReminder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reminder not found",
                },
                { status: 404 }
            );
        }

        // Parse multipart/form-data
        const formData = await req.formData();

        // Single agreement file
        const agreementFile = formData.get("agreement") as File | null;

        // Multiple payment slips
        const slipFiles = formData.getAll("paymentSlip") as File[];

        // Extract other fields (exclude files)
        const rawBody = Object.fromEntries(
            [...formData.entries()].filter(
                ([key]) => key !== "agreement" && key !== "paymentSlip"
            )
        );

        // Validate raw fields (all fields optional for update)
        const { error, value: validatedBody } = updateReminderSchema.validate(
            rawBody,
            {
                abortEarly: false,
                stripUnknown: true // Remove unknown fields
            }
        );

        if (error) {
            const errorMessages = error.details.reduce((acc, curr) => {
                acc[curr.path[0] as string] = curr.message;
                return acc;
            }, {} as Record<string, string>);

            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: errorMessages,
                    data: null,
                },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = { ...validatedBody };

        // Handle agreement file upload if provided
        if (agreementFile && agreementFile.size > 0) {
            const buffer = Buffer.from(await agreementFile.arrayBuffer());
            const uploadResult = await uploadBufferToS3(
                buffer,
                agreementFile.type,
                agreementFile.name,
                "reminders/agreements"
            );
            if (uploadResult?.url) {
                updateData.agreement = uploadResult.url;
            }
        }

        // Handle payment slips upload if provided
        // Handle payment slips upload if provided
        if (slipFiles.length > 0 && slipFiles[0].size > 0) {
            const paymentSlipUrls: string[] = [];

            for (const file of slipFiles) {
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const uploadResult = await uploadBufferToS3(
                        buffer,
                        file.type,
                        file.name,
                        "reminders/payment-slips"
                    );
                    if (uploadResult?.url) paymentSlipUrls.push(uploadResult.url);
                }
            }

            const existingPayment = existingReminder.payment || [];
            const paymentMonth = validatedBody.paymentMonth as string | undefined;

            if (paymentMonth) {
                // check if this month already exists
                const monthIndex = existingPayment.findIndex(p => p.month === paymentMonth);
                if (monthIndex >= 0) {
                    // month exists → append new slips
                    existingPayment[monthIndex].slip.push(
                        ...paymentSlipUrls.map(url => ({ url }))
                    );
                } else {
                    // month not present → add new month entry
                    existingPayment.push({
                        month: paymentMonth,
                        slip: paymentSlipUrls.map(url => ({ url })),
                    });
                }
            } else {
                // no month given → add to most recent month or create new
                if (existingPayment.length > 0) {
                    existingPayment[0].slip.push(
                        ...paymentSlipUrls.map(url => ({ url }))
                    );
                } else {
                    existingPayment.push({
                        month: new Date().toISOString().slice(0, 7), // current YYYY-MM
                        slip: paymentSlipUrls.map(url => ({ url })),
                    });
                }
            }

            updateData.payment = existingPayment;
        }

        // Handle vendorStatus conversion
        if (validatedBody.vendorStatus !== undefined) {
            updateData.vendorStatus = validatedBody.vendorStatus === "true" || validatedBody.vendorStatus === true;
        }

        // Handle amount conversion to number
        if (validatedBody.amount !== undefined) {
            updateData.amount = Number(validatedBody.amount);
        }

        // Handle beforeDays conversion to number
        if (validatedBody.beforeDays !== undefined) {
            updateData.beforeDays = Number(validatedBody.beforeDays);
        }

        // Update the reminder
        const updatedReminder = await Reminder.findByIdAndUpdate(
            id,
            {
                ...updateData,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
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

// PATCH endpoint for partial updates (like vendorStatus toggle)
export const PATCH = verifyAdmin(
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

        // Check if reminder exists
        const existingReminder = await Reminder.findById(id);
        if (!existingReminder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reminder not found",
                },
                { status: 404 }
            );
        }

        const body = await req.json();

        // Validate that only allowed fields are being updated
        const allowedFields = ['vendorStatus', 'paymentStatus', 'description'];
        const updateData: any = {};

        Object.keys(body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = body[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No valid fields to update",
                },
                { status: 400 }
            );
        }

        // Update the reminder
        const updatedReminder = await Reminder.findByIdAndUpdate(
            id,
            {
                ...updateData,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
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

// DELETE reminder by ID
export const DELETE = verifyAdmin(
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

        const deletedReminder = await Reminder.findByIdAndDelete(id);

        if (!deletedReminder) {
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
            message: "Reminder deleted successfully",
            data: deletedReminder,
        });
    })
);