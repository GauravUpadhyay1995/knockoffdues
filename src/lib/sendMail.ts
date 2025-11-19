import { Resend } from "resend";
import { getLetterTemplate } from "./letterTemplates";
import AWS from "aws-sdk";
import { Config } from "@/models/Config";

AWS.config.update({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});
const resend = new Resend(process.env.RESEND_API_KEY);
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
export const sendLetterEmail = async ({
  to,
  letterType,
  userData,
  letterUrl,
}: {
  to: string;
  letterType: string;
  userData: any;
  letterUrl: string;
}) => {
  const { subject, html } = getLetterTemplate(letterType, userData, letterUrl);

  try {
    const response = await resend.emails.send({
      from: "it@truebusinessminds.com", // ✅ verified domain email
      to,
      subject,
      html,
    });

    console.log("✅ Mail sent successfully:", response);
    return response;
  } catch (err) {
    console.error("❌ Failed to send mail:", err);
    throw err;
  }
};

export const sendBulkEmail = async ({
  employeeData,
  subject,
  body,
}) => {
  try {
    console.log("Preparing to send bulk emails to:", employeeData);
    const companyData = await Config.findOne().sort({ createdAt: -1 }).lean();

    if (!companyData) throw new Error("Company config missing");
    const BATCH_SIZE = 500;
    const results = [];
    for (let i = 0; i < employeeData.length; i += BATCH_SIZE) {
      const batch = employeeData.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map(async (emp) => {
          if (!emp.email) return null;

          const dynamicBody = safeReplace(body, emp, companyData);

          const params = {
            QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
            MessageBody: JSON.stringify({
              email: emp.email,
              subject,
              body: dynamicBody,
            }),
          };

          const res = await sqs.sendMessage(params).promise();
          return res.MessageId;
        })
      );

      results.push(...batchResults);
    }

    return {
      success: true,
      message: "Emails queued successfully",
      count: results.length,
    };
  } catch (error) {
    console.error("❌ BULK EMAIL ERROR:", error);
    throw new Error("Failed to queue emails");
  }
};


function safeReplace(template = "", emp = {}, company = {}) {
  const today = new Date().toISOString().split("T")[0];

  const safe = (v) => (v ? v : "");

  // const replacements = {
  //   "{#employeeName}": safe(emp.name),
  //   "{#employeeEmail}": safe(emp.email),
  //   "{#employeeMobile}": safe(emp.mobile),
  //   "{#employeeID}": safe(emp.emp_id),
  //   "{#employeeDepartment}": safe(emp.department?.department),
  //   "{#employeeJoiningDate}": safe(emp.jod),
  //   "{#employeePosition}": safe(emp.position),
  //   "{#companyName}": safe(company.companyName),
  //   "{#companyEmail}": safe(company.companyEmail),
  //   "{#companyAddress}": safe(company.companyAddress),
  //   "{#currentDate}": today,
  // };
  const replacements = {
    '{#employeeName}': safe(emp.name),
    '{#employeeEmail}': safe(emp.email),
    '{#employeeMobile}': safe(emp.mobile),

    '{#employeeID}': safe(emp.emp_id),
    '{#employeeJoiningLetterUrl}': safe(emp?.letters[0]?.url),
    '{#employeeExperienceLetterUrl}': safe(emp?.letters[1]?.url),


    '{#employeeJoiningDate}': safe(emp.jod),
    '{#employeeDepartment}': safe(emp.department.department),
    '{#employeeAddress}': safe(emp.permanentAddress),
    '{#employeePosition}': safe(emp.position),
    '{#employeeRole}': safe(emp.role),

    '{#companyName}': safe(company.companyName),
    '{#companyEmail}': safe(company.companyEmail),
    '{#companyWhatsapp}': safe(company.companyWhatsapp),
    '{#companyLogo}': safe(company.companyLogo),
    '{#companyAddress}': safe(company.companyAddress),


    '{#currentDate}': safe(today),
    '{#OTPCode}': safe(emp.otp),
    '{#emailVerificationLink}': safe(emp.emailVerificationLink),
  };

  let output = template;
  Object.keys(replacements).forEach((key) => {
    output = output.replace(new RegExp(key, "g"), replacements[key]);
  });

  return output;
}

