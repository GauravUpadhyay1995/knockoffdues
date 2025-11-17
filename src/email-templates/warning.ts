export const WARNING_TEMPLATE =   `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color: #d9534f; color: white; text-align: center; padding: 25px 15px;">
    <img src="{#companyLogo}" alt="{#companyName} Logo" style="max-width: 120px; margin-bottom: 10px;" />
    <h2 style="margin: 0; font-weight: 600;">Official Warning Notice</h2>
    <p style="margin: 5px 0 0; font-size: 15px;">{#companyName}</p>
  </div>

  <!-- Body -->
  <div style="background-color: #fff; padding: 30px;">
    <p>Dear <strong>{#employeeName}</strong>,</p>

    <p>This email serves as an official <strong>Warning Notice</strong> regarding your recent conduct/performance at <strong>{#companyName}</strong>.</p>

    <p>
      <strong>Reason for Warning:</strong><br />
      {#warningReason}
    </p>

    <p>You are expected to maintain professional behaviour and follow all company policies and guidelines. Any further violations may lead to stricter disciplinary actions, including suspension or termination.</p>

    <p>We encourage you to treat this matter seriously and take immediate corrective steps.</p>

    <p>If you have any concerns or need clarification, please reach out to your reporting manager or contact HR at 
      <a href="mailto:{#companyEmail}" style="color: #d9534f;">{#companyEmail}</a>.
    </p>

    <br />
    <p>Sincerely,</p>
    <p><strong>The HR Team</strong><br />
      {#companyName}<br />
      Email: <a href="mailto:{#companyEmail}" style="color: #d9534f;">{#companyEmail}</a><br />
      WhatsApp: <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #d9534f;">{#companyWhatsapp}</a><br />
      Address: {#companyAddress}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f4f4f4; font-size: 12px; color: #777; text-align: center; padding: 15px 20px; border-top: 1px solid #ddd;">
    <p>This email and any attachments are confidential. If you are not the intended recipient, please delete this email immediately.</p>
  </div>
</div>
`;
