import { Resend } from "resend";
import { getLetterTemplate } from "./letterTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

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
