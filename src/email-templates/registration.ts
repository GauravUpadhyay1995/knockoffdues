const VerificationLink = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "localhost:3000"
  : process.env.NEXT_PUBLIC_LIVE_DOMAIN;

export const REG_TEMPLATE = `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color:  #004aad; color: white; text-align: center; padding: 25px 15px;">
    <img src="{#companyLogo}" alt="{#companyName} Logo" style="max-width: 120px; margin-bottom: 10px;" />
    <h2 style="margin: 0; font-weight: 600;">Welcome to {#companyName}</h2>
    <p style="margin: 5px 0 0; font-size: 15px;">Your account has been created</p>
  </div>

  <!-- Body -->
  <div style="background-color: #fff; padding: 30px;">
    <p>Dear <strong>{#employeeName}</strong>,</p>

    <p>Welcome to <strong>{#companyName}</strong>! We’re excited to have you join our platform.</p>

    <p>Your account has been successfully registered. Please verify your email by clicking below verify button to access your dashboard:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${VerificationLink}/api/v1/admin/verify-email/{#emailVerificationLink}" target="_blank" style="background-color: #e60076; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        Click to Verify
      </a>
    </div>

    <p>We recommend updating your password after your first login to ensure maximum security.</p>

    <p>If you need assistance at any point, feel free to contact us at:</p>

    <ul>
      <li>Email: <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a></li>
      <li>WhatsApp: <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #004aad;">{#companyWhatsapp}</a></li>
      <li>Address: {#companyAddress}</li>
    </ul>

    <br />
    <p>We’re thrilled to have you onboard!</p>
    <p><strong>Warm regards,</strong><br />
      The Support Team<br />
      {#companyName}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f4f4f4; font-size: 12px; color: #777; text-align: center; padding: 15px 20px; border-top: 1px solid #ddd;">
    <p>This email and any files transmitted with it are confidential and may contain privileged or copyrighted information. 
    If you are not the intended recipient, please notify the sender immediately and delete this email from your system.</p>
  </div>
</div>
`;
