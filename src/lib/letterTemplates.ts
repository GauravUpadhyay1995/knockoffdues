import getSettings from '@/utils/getSettings';
const settings = await getSettings();

export const getLetterTemplate = (
  letterType: string,
  userData: any,
  letterUrl: string
): { subject: string; html: string } => {

  const id = userData._id.toString();
  const EMPID = id.slice(-5) || "XXXX";
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });


  const baseStyles = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
        color: #2D3748;
        line-height: 1.6;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
      }
      
      .letter-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        position: relative;
      }
      
      .letter-header {
        background: linear-gradient(135deg, #c4320a 0%, #d96646ff 100%);
        color: white;
        padding: 40px;
        text-align: center;
        position: relative;
      }
      
      .company-logo {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 2px;
        margin-bottom: 8px;
      }
      
      .company-tagline {
        font-size: 14px;
        opacity: 0.9;
        font-weight: 300;
      }
      
      .letter-body {
        padding: 50px;
        position: relative;
      }
      
     
      
      .content {
        position: relative;
        z-index: 10;
      }
      
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 30px;
        color: #c4320a;
      }
      
      .letter-content {
        font-size: 15px;
        margin-bottom: 25px;
        text-align: justify;
      }
      
      .highlight-box {
        background: #f8fafc;
        border-left: 4px solid #c4320a;
        padding: 20px;
        margin: 25px 0;
        border-radius: 0 8px 8px 0;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .detail-label {
        font-weight: 600;
        color: #4a5568;
      }
      
      .detail-value {
        font-weight: 500;
        color: #1e3a8a;
      }
      
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #c4320a 0%, #df6746ff 100%);
        color: #ede2dfff !important;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 20px 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px  rgba(151, 57, 33, 0.4);
      }
      
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(151, 57, 33, 0.4);
      }
      
      .letter-footer {
        margin-top: 40px;
        padding-top: 30px;
        border-top: 2px solid #e2e8f0;
      }
      
      .signature {
        margin-top: 30px;
      }
      
      .signature-name {
        font-weight: 700;
        color: #1e3a8a;
        margin-bottom: 5px;
      }
      
      .signature-title {
        color: #6b7280;
        font-size: 14px;
      }
      
      .contact-info {
        background: #f1f5f9;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
        font-size: 14px;
        color: #64748b;
      }
      
      @media (max-width: 768px) {
        body {
          padding: 20px 10px;
        }
        
        .letter-body {
          padding: 30px 20px;
        }
        
        .letter-header {
          padding: 30px 20px;
        }
        
       
      }
    </style>
  `;

  switch (letterType) {
    case "joining":
      return {
        subject: `Welcome to ${settings.companyName} - Joining Letter for ${userData.name}`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            ${baseStyles}
          </head>
          <body>
            <div class="letter-container">
              <div class="letter-header">
                <div class="company-logo">${settings.companyName}</div>
                <div class="company-tagline">Excellence in Business Solutions</div>
              </div>
              
              <div class="letter-body">
              
                
                <div class="content">
                  <div class="greeting">Dear ${userData.name},</div>
                  
                  <div class="letter-content">
                    On behalf of ${settings.companyName}, I am delighted to extend this formal offer of employment for the position of <strong>${userData.position}</strong>. We were particularly impressed with your qualifications and believe you will be a valuable addition to our team.
                  </div>
                  
                  <div class="highlight-box">
                    <div class="detail-item">
                      <span class="detail-label">Employee ID:</span>
                      <span class="detail-value">EMP/${EMPID}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Joining Date:</span>
                      <span class="detail-value">${userData.jod}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Position:</span>
                      <span class="detail-value">${userData.position}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Date Issued:</span>
                      <span class="detail-value">${currentDate}</span>
                    </div>
                  </div>
                  
                  <div class="letter-content">
                    This appointment letter outlines the terms and conditions of your employment. We are confident that your skills and experience will contribute significantly to our organization's success.
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${letterUrl}" class="cta-button">View Your Official Appointment Letter</a>
                  </div>
                  
                  <div class="letter-content" style="text-align: center;">
                    Please review the complete document carefully and feel free to reach out with any questions.
                  </div>
                </div>
                
                <div class="letter-footer">
                  <div class="letter-content">
                    Welcome aboard! We look forward to your valuable contributions and a successful journey together.
                  </div>
                  
                  <div class="signature">
                    <div class="signature-title">Head of Human Resources</div>
                    <div class="signature-title">${settings.companyName}</div>
                  </div>
                  
                  <div class="contact-info">
                    <strong>${settings.companyName}</strong><br>
                   ${settings.companyAddress}<br>
                    📞 ${settings.companyWhatsapp} | ✉️ ${settings.companyEmail}
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
        `
      };

    case "experience":
      return {
        subject: `Experience Certificate - ${userData.name} - ${settings.companyName}`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            ${baseStyles}
          </head>
          <body>
            <div class="letter-container">
              <div class="letter-header">
                <div class="company-logo">${settings.companyName}</div>
                <div class="company-tagline">Excellence in Business Solutions</div>
              </div>
              
              <div class="letter-body">
              
                <div class="content">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1e3a8a; font-size: 24px; margin-bottom: 10px;">EXPERIENCE CERTIFICATE</h2>
                    <div style="height: 3px; width: 80px; background: #3b82f6; margin: 0 auto;"></div>
                  </div>
                  
                  <div class="greeting" style="text-align: center;">To Whom It May Concern,</div>
                  
                  <div class="letter-content">
                    This is to certify that <strong>${userData.name}</strong> was employed with <strong>${settings.companyName}</strong> in the capacity of <strong>${userData.position}</strong> from <strong>${userData.jod}</strong> to <strong>${currentDate}</strong>.
                  </div>
                  
                  <div class="highlight-box">
                    <div style="text-align: center; font-weight: 600; color: #1e3a8a; margin-bottom: 15px;">EMPLOYMENT DETAILS</div>
                    <div class="detail-item">
                      <span class="detail-label">Employee Name:</span>
                      <span class="detail-value">${userData.name}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Position Held:</span>
                      <span class="detail-value">${userData.position}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Employment Period:</span>
                      <span class="detail-value">${userData.jod} to ${currentDate}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Certificate Date:</span>
                      <span class="detail-value">${currentDate}</span>
                    </div>
                  </div>
                  
                  <div class="letter-content">
                    During their tenure with our organization, ${userData.name} demonstrated exceptional professionalism, dedication, and technical competence. They consistently displayed strong work ethics and made significant contributions to our projects and team objectives.
                  </div>
                  
                  <div class="letter-content">
                    ${userData.name} proved to be a reliable and valuable team member, showing remarkable skills in problem-solving and adaptability in dynamic work environments. Their performance consistently met and often exceeded our expectations.
                  </div>
                  
                  <div class="letter-content">
                    We confirm that ${userData.name} left our organization in good standing, and we have no hesitation in recommending them for future employment opportunities. We are confident that they will be a valuable asset to any organization.
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${letterUrl}" class="cta-button">Download Official Experience Certificate</a>
                  </div>
                  
                  <div class="letter-content" style="text-align: center;">
                    We wish ${userData.name} continued success and prosperity in all future endeavors.
                  </div>
                </div>
                
                <div class="letter-footer">
                  <div class="signature" style="text-align: center;">
                   
                    <div class="signature-title">Director of Operations</div>
                    <div class="signature-title">${settings.companyName}</div>
                  </div>
                  
                  <div class="contact-info" style="text-align: center;">
                    <strong>${settings.companyName}</strong><br>
                    ${settings.companyAddress}<br>
                    📞  ${settings.companyWhatsapp} | ✉️ ${settings.companyEmail}<br>
                    <em>This certificate was issued electronically and is legally valid</em>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
        `
      };
    case "password_reset_otp":
      return {
        subject: `Your OTP Verification Code - ${userData.name} - ${settings.companyName}`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            ${baseStyles}
          </head>
          <body>
            <div class="letter-container">
              <div class="letter-header">
                <div class="company-logo">${settings.companyName}</div>
                <div class="company-tagline">Excellence in Business Solutions</div>
              </div>
              
              <div class="letter-body">
              
                <div class="content">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1e3a8a; font-size: 24px; margin-bottom: 10px;">Reset Password</h2>
                    <div style="height: 3px; width: 80px; background: #3b82f6; margin: 0 auto;"></div>
                  </div>
                  
                  
                  <div class="letter-content">
                   Hi <strong>${userData.name},</strong> 
                  </div>
                  
               
                  <div class="letter-content">
                  We received a request to reset your password.
                  Your One-Time Password (OTP) is:                  
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="#" class="cta-button">${letterUrl}</a>
                  </div>
                </div>
                
                <div class="letter-footer">
                  <div class="signature" style="text-align: center;">
                   
                    <div class="signature-title">Director of Operations</div>
                    <div class="signature-title">${settings.companyName}</div>
                  </div>
                  
                  <div class="contact-info" style="text-align: center;">
                    <strong>${settings.companyName}</strong><br>
                    ${settings.companyAddress}<br>
                    📞  ${settings.companyWhatsapp} | ✉️ ${settings.companyEmail}<br>
                    <em>This certificate was issued electronically and is legally valid</em>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
        `
      };

    default:
      return {
        subject: "Official Communication - ${settings.companyName}",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            ${baseStyles}
          </head>
          <body>
            <div class="letter-container">
              <div class="letter-header">
                <div class="company-logo">${settings.companyName}</div>
                <div class="company-tagline">Excellence in Business Solutions</div>
              </div>
              
              <div class="letter-body">
                <div class="content">
                  <div class="greeting">Dear ${userData.name},</div>
                  
                  <div class="letter-content">
                    Please find your official document from ${settings.companyName}. This communication contains important information regarding your association with our organization.
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${letterUrl}" class="cta-button">Access Your Document</a>
                  </div>
                  
                  <div class="letter-content">
                    Should you have any questions or require further assistance, please don't hesitate to contact our HR department.
                  </div>
                </div>
                
                <div class="letter-footer">
                  <div class="signature">
                    <div class="signature-name">HR Department</div>
                    <div class="signature-title">${settings.companyName}</div>
                  </div>
                  
                  <div class="contact-info">
                    <strong>Human Resources Department</strong><br>
                    ${settings.companyName}<br>
                    📞  ${settings.companyWhatsapp} | ✉️  ${settings.companyEmail}
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
        `,
      };
  }
};