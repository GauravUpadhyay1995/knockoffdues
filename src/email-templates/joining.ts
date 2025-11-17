export const JOINING_TEMPLATE = `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color: #00a63e; color: white; text-align: center; padding: 25px 15px;">
    <img src="{#companyLogo}" alt="{#companyName} Logo" style="max-width: 120px; margin-bottom: 10px;">
    <h2 style="margin: 0; font-weight: 600;">Welcome to {#companyName}</h2>
    <p style="margin: 5px 0 0; font-size: 15px;">Your Journey Begins Here</p>
  </div>

  <!-- Body -->
  <div style="background-color: #fff; padding: 30px;">
    <p>Dear <strong>{#employeeName}</strong>,</p>

    <p>We are delighted to welcome you to <strong>{#companyName}</strong>!</p>

    <p>Congratulations on being selected for the position of <strong>{#employeePosition}</strong>. We are excited to have you as part of our team and look forward to a long and fulfilling association.</p>

    <p>Your joining date is scheduled for <b>{#employeeJoiningDate}</b>. Please report to the <b>{#employeeDepartment}</b>&nbsp;at <b>9:30 AM</b> on that day. Kindly bring all the required documents mentioned in your offer letter for verification.</p>

    <p>Attached to this email is your official <strong>Joining Letter</strong> which contains important details about your role, employment terms, and onboarding process.</p>
     <div style="text-align: center; margin: 30px 0;">
      <a href="{#employeeJoiningLetterUrl}" target="_blank" style="background-color: #00a63e; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        DONWLOAD
      </a>
    </div>

    <p>If you have any questions or need assistance, please reach out to us at <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a> or via WhatsApp at <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #004aad;">{#companyWhatsapp}</a>.</p>

    <p>Once again, welcome aboard! We’re thrilled to have you join the <strong>{#companyName}</strong> family.</p>

    <br>
    <p>Warm regards,</p>
    <p><strong>The HR Team</strong><br>
       <img src="{#companyLogo}" alt="{#companyName} Logo" style="max-width: 120px; margin-bottom: 10px;"><br>
      {#companyName}<br>
      Email: <a href="mailto:{#companyEmail}" style="color: #004aad;">{#companyEmail}</a><br>
      WhatsApp: <a href="https://wa.me/{#companyWhatsapp}" target="_blank" style="color: #004aad;">{#companyWhatsapp}</a><br>
      Address: {#companyAddress}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f4f4f4; font-size: 12px; color: #777; text-align: center; padding: 15px 20px; border-top: 1px solid #ddd;">
    <p>This email and any files transmitted with it are confidential and may contain privileged or copyrighted information. 
    If you are not the intended recipient, please notify the sender immediately and delete this email from your system.</p>
  </div>
</div>
`
