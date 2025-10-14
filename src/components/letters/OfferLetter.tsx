// components/letters/OfferLetter.tsx
import React from 'react';
import { LetterBaseProps } from '@/types/letter.types';
import LetterLayout from './LetterLayout';



const OfferLetter = ({ employeeData }: { employeeData: any }) => {

  return (
    <LetterLayout title="Offer of Employment">
      <div className="space-y-6 text-gray-700">

        <div>
          <p className="font-semibold text-lg mb-4">Dear {employeeData?.name},</p>
          <p className="mb-4">
            We are pleased to offer you the position of <strong>{employeeData?.position}</strong> in the <strong>{employeeData?.department}</strong> department at . This letter outlines the terms and conditions of your employment.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Position:</strong> {employeeData?.position}
            </div>
            <div>
              <strong>Department:</strong>{employeeData?.department}
            </div>
            <div>
              <strong>Start Date:</strong>{employeeData?.jod}
            </div>
            <div>
              <strong>Reporting To:</strong> 9:30 AM
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <strong>Compensation:</strong>
            <p className="mt-2">₹{employeeData?.currentSalary}</p>
          </div>

          {/* <div>
            <strong>Benefits Package:</strong>
            <ul className="list-disc list-inside mt-2 ml-4">
              {benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div> */}
        </div>

        <div className="space-y-4">
          <p>
            This offer is contingent upon the successful completion of background checks and reference verification. Please sign and return this letter by [Date] to indicate your acceptance.
          </p>

          <p>
            We look forward to welcoming you to the team and are confident that you will make valuable contributions to our organization.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <div>
            <p>Sincerely,</p>
            <p className="mt-8 font-semibold">Kavita</p>
            <p>HR Manager</p>

          </div>

          <div className="border-t-2 border-gray-300 pt-8">
            <p className="font-semibold">Acceptance of Offer</p>
            <p className="mt-4">I, {employeeData?.name}, accept the terms of this employment offer.</p>

            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <p className="border-b border-gray-300 pb-2">Signature</p>
                <p className="text-sm text-gray-500 mt-1">employeeData</p>
              </div>
              <div>
                <p className="border-b border-gray-300 pb-2">Date</p>
                <p className="text-sm text-gray-500 mt-1">MM/DD/YYYY</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LetterLayout>
  );
};

export default OfferLetter;