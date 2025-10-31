import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { verifyAdmin } from '@/lib/verifyAdmin';
import puppeteer from 'puppeteer';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { updateLetterRecords } from '@/lib/updateLetterRecords'; // optional helper
import { User } from "@/models/User"; // assuming you store letter records in MongoDB

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const admin = (req as any).user;

    const body = await req.json();
    const { letterType, userData } = body;

    // ✅ Generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const html = generateHTML(letterType, userData);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // ✅ Upload PDF to S3
    const fileName = `${letterType}-${userData._id}.pdf`;
    const uploaded = await uploadBufferToS3(
      pdfBuffer,
      'application/pdf',
      fileName,
      'letters'
    );
    // ✅ Run background updates (non-blocking)
    (async () => {
      try {
        await updateLetterRecords(userData._id, uploaded.url, letterType, admin);
      } catch (err) {
        console.error('Background update failed:', err);
      }
    })();

    return NextResponse.json({
      success: true,
      message: 'Letter generated and uploaded to S3 successfully',
      url: uploaded.url,
    });
  })
);






function generateHTML(letterType: string, userData: any): string {
  let html = '';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const id = userData._id.toString();
  const EMPID = id.slice(-5);

  if (letterType === 'joining') {
    html = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            color: #374151;
            padding: 40px;
            position: relative;
          }

          /* ✅ Watermark styling */
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 90px;
            font-weight: 700;
            color: rgba(55, 65, 81, 0.08); /* soft gray */
            white-space: nowrap;
            z-index: 0;
            pointer-events: none;
            user-select: none;
          }

          .content {
            position: relative;
            z-index: 10;
          }

          ol, ul {
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <!-- ✅ Watermark -->
        <div class="watermark">KNOCKOFF DUES</div>

        <div class="content">
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
              <div>
                <img src="https://knock-off-dues.s3.ap-south-1.amazonaws.com/avatar/1757486751470-grok-image-d25c21db-dc8e-45a9-8964-4ee509c9215a.png"
                     alt="Company Logo"
                     style="width: 100px; height: auto;" />
              </div>
              <div style="text-align: right; max-width: 400px;">
                <p style="font-size: 14px; color: #6B7280;">Issue Date: ${currentDate}</p>
                <p style="font-size: 14px; color: #6B7280;">Ref: EMP/${EMPID}</p>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="font-weight: 600;">Dear ${userData.name},</p>
            </div>

            <div style="text-align: justify; line-height: 1.625;">
              <p style="margin-bottom: 16px;">
                With reference to your application and subsequent interviews, we are pleased to appoint you as
                <strong>${userData.position}</strong> in our organization.
              </p>
              <p style="margin-bottom: 16px;">
                Your appointment will be effective from <strong>${userData.jod}</strong>. You are required to report for duty at 9:00 AM on your joining date at our office premises.
              </p>
              <p style="margin-bottom: 16px;">
                Your Employee ID is: <strong>EMP/${EMPID}</strong>
              </p>

              <div style="margin-top: 24px;">
                <p style="font-weight: bold; margin-bottom: 12px;">Terms & Conditions of Employment:</p>
                <ol>
                  <li>You will be on probation for a period of 3 months from the date of joining.</li>
                  <li>Your compensation and benefits will be as discussed during your interview process.</li>
                  <li>You will be governed by the company's rules and regulations as amended from time to time.</li>
                  <li>Your performance will be reviewed periodically as per company policy.</li>
                </ol>
              </div>

              <div style="margin-top: 24px;">
                <p style="font-weight: bold; margin-bottom: 8px;">Please bring the following documents on your joining date:</p>
                <ul>
                  <li>Original educational certificates and mark sheets</li>
                  <li>Identity proof (Aadhar Card, PAN Card, Passport)</li>
                  <li>Address proof</li>
                  <li>Passport size photographs (4 copies)</li>
                  <li>Experience certificates from previous employers (if any)</li>
                </ul>
              </div>

              <p style="margin-top: 16px;">
                We believe that your skills and experience will be a valuable asset to our organization.
                We look forward to a long and mutually rewarding association.
              </p>
            </div>

            <div style="margin-top: 48px;">
              <p>Yours faithfully,</p>
              <p style="font-weight: 600; margin-top: 4px;">Kavita</p>
              <p>Human Resources Manager</p>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
  }
  else if (letterType === 'experience') {
    html = `
  <html>
    <head>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          color: #374151;
          padding: 40px;
          position: relative;
        }

        /* ✅ Watermark styling */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 90px;
          font-weight: 700;
          color: rgba(55, 65, 81, 0.08);
          white-space: nowrap;
          z-index: 0;
          pointer-events: none;
          user-select: none;
        }

        .content {
          position: relative;
          z-index: 10;
        }

        p {
          line-height: 1.625;
        }
      </style>
    </head>
    <body>
      <!-- ✅ Watermark -->
      <div class="watermark">KNOCKOFF DUES</div>

      <div class="content">
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div>
              <img src="https://knock-off-dues.s3.ap-south-1.amazonaws.com/avatar/1757486751470-grok-image-d25c21db-dc8e-45a9-8964-4ee509c9215a.png"
                   alt="Company Logo"
                   style="width: 100px; height: auto;" />
            </div>
            <div style="text-align: right; max-width: 400px;">
              <p style="font-size: 14px; color: #6B7280;">Issue Date: ${currentDate}</p>
              <p style="font-size: 14px; color: #6B7280;">Ref: EXP/${EMPID}</p>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="font-weight: 600;">To Whom It May Concern,</p>
          </div>

          <div style="text-align: justify;">
            <p style="margin-bottom: 16px;">
              This is to certify that <strong>${userData.name}</strong> was employed with <strong>KnockOff Dues</strong> as a
              <strong>${userData.position}</strong> from <strong>${userData.jod}</strong> to
              <strong>${userData.relieveDate || currentDate}</strong>.
            </p>

            <p style="margin-bottom: 16px;">
              During this period, ${userData.name.split(" ")[0]} performed ${userData.gender === "female" ? "her" : "his"} duties
              diligently and efficiently. ${userData.gender === "female" ? "She" : "He"} was sincere, hardworking, and maintained
              good interpersonal relations with peers and superiors.
            </p>

            <p style="margin-bottom: 16px;">
              ${userData.name.split(" ")[0]}'s contributions were valuable to the organization, and ${userData.gender === "female" ? "she" : "he"}
              demonstrated strong professional ethics and a commitment to quality work.
            </p>

            <p style="margin-bottom: 16px;">
              We wish ${userData.name.split(" ")[0]} all the very best in ${userData.gender === "female" ? "her" : "his"} future endeavors.
            </p>
          </div>

          <div style="margin-top: 48px;">
            <p>Yours faithfully,</p>
            <p style="font-weight: 600; margin-top: 4px;">Kavita</p>
            <p>Human Resources Manager</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
  }


  return html;
}


