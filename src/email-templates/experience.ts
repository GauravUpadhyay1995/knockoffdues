export const EXPERIENCE_TEMPLATE = `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6;  margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color: #d08700; color: white; text-align: center; padding: 25px 15px;">
    <img src="{#companyLogo}" alt="{#companyName} Logo" style="max-width: 120px; margin-bottom: 10px;" />
    <h2 style="margin: 0; font-weight: 600;">Experience Letter Issued</h2>
    <p style="margin: 5px 0 0; font-size: 15px;">{#companyName}</p>
  </div>

  <!-- Body -->
  <div style="background-color: #fff; padding: 30px;">
    <p>Dear <strong>{#employeeName}</strong>,</p>

    <p>We are pleased to inform you that your official <strong>Experience Letter</strong> has been generated and attached with this email.</p>

    <p>
      <strong>Employment Details:</strong><br />
      Position: {#employeeDesignation}<br />
      Employee ID: {#employeeId}<br />
      Duration: {#startDate} to {#endDate}<br />
    </p>

    <p>During your employment at <strong>{#companyName}</strong>, you demonstrated professionalism, dedication, and valuable contributions to the organization.</p>

    <p>Your Experience Letter includes all necessary employment details that may assist you in your future professional endeavours.</p>
     <div style="text-align: center; margin: 30px 0;">
      <a href="{#employeeExperienceLetterUrl}" target="_blank" 
         style="background-color: #d08700; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 500;">
       DOWNLOAD
      </a>
    </div>

    <p>If you require any further documents or clarifications, feel free to contact us at 
      <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a>.
    </p>

    <br />
    <p>Best wishes for your future!</p>

    <p><strong>The HR Team</strong><br />
      {#companyName}<br />
      Email: <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a><br />
      WhatsApp: <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #004aad;">{#companyWhatsapp}</a><br />
      Address: {#companyAddress}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f4f4f4; font-size: 12px; color: #777; text-align: center; padding: 15px 20px; border-top: 1px solid #ddd;">
    <p>This email and any attachments are confidential. If you are not the intended recipient, please delete this email immediately.</p>
  </div>
</div>
`;
