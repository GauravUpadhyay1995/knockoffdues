export const RESET_TEMPLATE  = `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color: #e60076; color: white; text-align: center; padding: 25px 15px;">
    <img src="{#companyLogo}" alt="{#companyName} Logo" style="max-width: 120px; margin-bottom: 10px;" />
    <h2 style="margin: 0; font-weight: 600;">Password Reset Request</h2>
    <p style="margin: 5px 0 0; font-size: 15px;">Assisting you securely</p>
  </div>

  <!-- Body -->
  <div style="background-color: #fff; padding: 30px;">
    <p>Dear <strong>{#employeeName}</strong>,</p>

    <p>We received a request to reset your password associated with your account at <strong>{#companyName}</strong>.</p>

    <p>If you made this request, please click the button below to securely reset your password:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="#"style="background-color: #e60076; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        {#OTPCode}
      </a>
    </div>

    <p>If you didn’t request this change, please ignore this email. Your password will remain unchanged.</p>

    <p>For any help or queries, you can contact our support team at 
      <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a> 
      or message us on WhatsApp at 
      <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #004aad;">{#companyWhatsapp}</a>.
    </p>

    <br />
    <p>Best regards,</p>
    <p><strong>The Support Team</strong><br />
      {#companyName}<br />
      Email: <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a><br />
      WhatsApp: <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #004aad;">{#companyWhatsapp}</a><br />
      Address: {#companyAddress}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f4f4f4; font-size: 12px; color: #777; text-align: center; padding: 15px 20px; border-top: 1px solid #ddd;">
    <p>This email and any files transmitted with it are confidential and may contain privileged or copyrighted information. 
    If you are not the intended recipient, please notify the sender immediately and delete this email from your system.</p>
  </div>
</div>
`;
