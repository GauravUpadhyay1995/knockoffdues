// app/api/reminders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Reminder } from "@/models/Reminder";
import { uploadBufferToS3 } from "@/lib/uploadToS3";
import { createReminderSchema } from "@/lib/validations/reminder.schema";
import { verifyAdmin } from "@/lib/verifyAdmin";

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;

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

    // Validate raw fields
    const { error, value: validatedBody } = createReminderSchema.validate(
      rawBody,
      { abortEarly: false }
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

    // Upload agreement to S3
    let agreementUrl: string | undefined;
    if (agreementFile && agreementFile.size > 0) {
      const buffer = Buffer.from(await agreementFile.arrayBuffer());
      const uploadResult = await uploadBufferToS3(
        buffer,
        agreementFile.type,
        agreementFile.name,
          "reminders/agreements/"
      );
      agreementUrl = uploadResult?.url;
    }

    // Upload payment slips
    const paymentSlipUrls: string[] = [];
    for (const file of slipFiles) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult = await uploadBufferToS3(
          buffer,
          file.type,
          file.name,
           "reminders/agreements/"
        );
        if (uploadResult?.url) paymentSlipUrls.push(uploadResult.url);
      }
    }

    // Map slips into payment array
    const paymentArray = validatedBody.paymentMonth
      ? [
          {
            month: validatedBody.paymentMonth,
            slip: paymentSlipUrls.map((url) => ({ url })),
          },
        ]
      : [];

    // Prepare final reminder data
    const reminderData = {
      ...validatedBody,
      agreement: agreementUrl || "",
      payment: paymentArray,
      creator: user.id,
    };

    // Save to DB
    const createdReminder = new Reminder(reminderData);
    await createdReminder.save();

    return NextResponse.json({
      success: true,
      message: "Reminder created successfully",
      data: createdReminder,
    });
  })
);

// GET API remains unchanged
export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("q") || "";

  const filter: any = {};
  if (search) {
    filter.vendorName = { $regex: search, $options: "i" };
  }

  const [items, total] = await Promise.all([
    Reminder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Reminder.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});
