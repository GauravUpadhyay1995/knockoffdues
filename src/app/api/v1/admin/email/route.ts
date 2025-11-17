// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { MailConfig } from "@/models/MailConfig";
import { verifyAdmin } from "@/lib/verifyAdmin";

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;

    // Parse multipart/form-data
    const formData = await req.formData();
    console.log("User updating settings:", Object.fromEntries(formData.entries()));

    // Extract nested values correctly
    const allowed = formData.get("bulk_email_template[allowed]");
    const subject = formData.get("bulk_email_template[subject]");
    const body = formData.get("bulk_email_template[body]");

    const joining_email_template_allowed = formData.get("joining_email_template[allowed]");
    const joining_email_template_subject = formData.get("joining_email_template[subject]");
    const joining_email_template_body = formData.get("joining_email_template[body]");

    const reset_password_email_template_allowed = formData.get("reset_password_email_template[allowed]");
    const reset_password_email_template_subject = formData.get("reset_password_email_template[subject]");
    const reset_password_email_template_body = formData.get("reset_password_email_template[body]");

    const registration_email_template_allowed = formData.get("registration_email_template[allowed]");
    const registration_email_template_subject = formData.get("registration_email_template[subject]");
    const registration_email_template_body = formData.get("registration_email_template[body]");



    // Prepare settings data correctly
    const settingsData: any = {
      bulk_email_template: {
        allowed: allowed === "true", // convert string to boolean
        subject: subject || "Important Update",
        body:
          body ||
          "<p>Dear User,</p><p>We have an important update for you.</p><p>Best regards,<br/>The Team</p>",
      },
      joining_email_template: {
        allowed: joining_email_template_allowed === "true",
        subject: joining_email_template_subject || "Important Update",
        body:
          joining_email_template_body ||
          "<p>Dear User,</p><p>We have an important update for you.</p><p>Best regards,<br/>The Team</p>",
      },
      reset_password_email_template: {
        allowed: reset_password_email_template_allowed === "true",
        subject: reset_password_email_template_subject || "Important Update",
        body:

          reset_password_email_template_body ||
          "<p>Dear User,</p><p>We have an important update for you.</p><p>Best regards,<br/>The Team</p>",
      },
      registration_email_template: {
        allowed: registration_email_template_allowed === "true",
        subject: registration_email_template_subject || "Important Update",
        body:
          registration_email_template_body ||
          "heloo",
      },


    };

    // Find existing config or create new
    const existingSetting = await MailConfig.findOne();

    let updatedSetting;
    if (existingSetting) {
      updatedSetting = await MailConfig.findOneAndUpdate(
        { _id: existingSetting._id },
        settingsData,
        { new: true, runValidators: true }
      );
    } else {
      updatedSetting = await MailConfig.create(settingsData);
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: updatedSetting,
    });
  })
);


// FIXED: GET route for settings
export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  // For settings, we usually want just one document
  const settings = await MailConfig.findOne().sort({ createdAt: -1 }).lean();

  // If no settings exist, create default ones
  if (!settings) {
    const defaultSettings = await MailConfig.create({
      bulk_email_template: {
        allowed: true,
        subject: "Important Update",
        body: "<p>Dear User,</p><p>We have an important update for you.</p><p>Best regards,<br/>The Team</p>",
      }

    });
    return NextResponse.json({
      success: true,
      data: defaultSettings,
    });
  }

  return NextResponse.json({
    success: true,
    data: settings,
  });
});