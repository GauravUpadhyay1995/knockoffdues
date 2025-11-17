import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { createUserSchema } from "@/lib/validations/user.schema";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { uploadBufferToS3 } from "@/lib/uploadToS3";
import { getHr } from "@/utils/helper"
import { createNotification } from "@/lib/createNotification";
import { MailConfig } from "@/models/MailConfig";
import { sendBulkEmail } from "@/lib/sendMail";
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();
    const hrData = await getHr();
    const userId = hrData._id.toString()
    const form = await req.formData();
    const resume = form.get("resume") as File | null;

    const jsonBody: any = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      mobile: form.get("mobile"),
      role: 'lead',
      isActive: form.get("isActive") === "true",
      permissions: form.get("permissions")
        ? JSON.parse(form.get("permissions") as string)
        : undefined,
    };

    // ✅ Validate using Joi
    const { error, value } = createUserSchema.validate(jsonBody, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      const message = error.details[0]?.message || "Validation failed";

      return NextResponse.json(
        { success: false, message, errors },
        { status: 400 }
      );
    }


    // ✅ Check existing user
    const existing = await User.findOne({
      $or: [{ email: value.email }, { mobile: value.mobile }],
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // ✅ Upload resume if provided
    let resumeUrl: string | undefined;
    if (resume) {
      const buffer = Buffer.from(await resume.arrayBuffer());
      const uploaded = await uploadBufferToS3(
        buffer,
        resume.type,
        resume.name,
        `dosuments`
      );
      resumeUrl = uploaded?.url;
    }

    // ✅ Create user
    const newUser = await User.create({
      ...value,
      password: hashedPassword,
      resume: resumeUrl,
    });

    const userObj = newUser.toObject();
    delete userObj.password;


    //Sending Email to verify customer
    const settings = await MailConfig.findOne().sort({ createdAt: -1 }).lean();
    if (!settings) {
      return NextResponse.json({ success: false, message: 'No Mail Settings Found' });
    }
    if (settings?.registration_email_template.allowed) {

      let body = settings?.registration_email_template.body;
      let subject = settings?.registration_email_template.subject;
      let employeeData = [userObj];
      const result = await sendBulkEmail({ employeeData, subject, body });

    }

    await createNotification({
      notificationType: "Followup",
      title: `A new Lead has been registered`,
      descriptions: `<b>Name</b>: ${jsonBody.name}<br><b>Email</b>: ${jsonBody.email}<br><b>Mobile</b>: ${jsonBody.mobile}`,
      docs: [],
      createdBy: userObj._id,
      userId: [userId],
    })


    return NextResponse.json(
      { success: true, message: "User Registered", data: userObj },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("User creation failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
};
