// components/letters/JoiningLetter.tsx
import React from 'react';
import { LetterBaseProps } from '@/types/letter.types';
import LetterLayout from './LetterLayout';

const JoiningLetter = ({ employeeData }: { employeeData: any }) => {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const id = employeeData._id.toString();
  const EMPID = id.slice(-5);
  return (
    <LetterLayout title="Joining Letter">
      <div className="space-y-6 text-gray-800 font-serif">
        {/* Company Letterhead */}


        {/* Date and Reference */}
        <div className="flex justify-between items-start mb-6">
          <div>

          </div>
          <div className="text-right max-w-md">
            <p className="text-sm text-gray-600">
              Issue Date: {currentDate}
            </p>
            <p className="text-sm text-gray-600">Ref: EMP/{EMPID}</p>
            {/* <p className="font-semibold">{employeeData?.name}</p>
            <p className="text-sm">{employeeData?.currentAddress}</p> */}
          </div>
        </div>

        {/* Subject */}
        {/* <div className="mb-6">
          <p className="font-bold text-lg uppercase">Subject: Appointment Letter - {employeeData?.position}</p>
        </div> */}

        {/* Salutation */}
        <div className="mb-4">
          <p className="font-semibold">
            Dear {employeeData?.name},
          </p>

        </div>

        {/* Main Content */}
        <div className="space-y-4 text-justify leading-relaxed">
          <p>
            With reference to your application and subsequent interviews, we are pleased to appoint you as <strong>{employeeData.position}</strong> in our organization.
          </p>

          <p>
            Your appointment will be effective from <strong>{employeeData.jod}</strong>. You are required to report for duty at 9:00 AM on your joining date at our office premises.
          </p>

          <p>
            Your Employee ID is: <strong>{EMPID}</strong>
          </p>

          {/* Terms and Conditions */}
          <div className="mt-6">
            <p className="font-bold mb-3">Terms & Conditions of Employment:</p>

            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>You will be on probation for a period of 3 months from the date of joining</li>
              <li>Your compensation and benefits will be as discussed during your interview process</li>
              <li>You will be governed by the company's rules and regulations as amended from time to time</li>
              <li>Your performance will be reviewed periodically as per company policy</li>
            </ol>
          </div>

          {/* Documents Required */}
          <div className="mt-6">
            <p className="font-bold mb-2">Please bring the following documents on your joining date:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Original educational certificates and mark sheets</li>
              <li>Identity proof (Aadhar Card, PAN Card, Passport)</li>
              <li>Address proof</li>
              <li>Passport size photographs (4 copies)</li>
              <li>Experience certificates from previous employers (if any)</li>
            </ul>
          </div>

          <p>
            We believe that your skills and experience will be a valuable asset to our organization. We look forward to a long and mutually rewarding association.
          </p>


        </div>

        {/* Closing */}
        <div className="mt-12 space-y-8">
          <div>
            <p>Yours faithfully,</p>
            <div className="mt-1">

              <div className="mt-1">
                <p className="font-semibold">Kavita</p>
                <p>Human Resources Manager</p>
              </div>
            </div>
          </div>

          {/* Acceptance Copy */}
          {/* <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <p className="font-bold mb-4">ACCEPTANCE COPY</p>
            <p>I, <strong>{employeeData?.name}</strong>, accept the appointment as <strong>{employeeData?.position}</strong> on the terms and conditions mentioned above.</p>

            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <p>Date: ________________</p>
              </div>
              <div>
                <p>Signature: ________________</p>
              </div>
            </div>
          </div> */}

          {/* Footer */}
          {/* <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
            <p>This is a computer-generated document and does not require a physical signature</p>
          </div> */}
        </div>
      </div>
    </LetterLayout>
  );
};

export default JoiningLetter;