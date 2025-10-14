// components/letters/TerminationLetter.tsx
import React from 'react';
import { LetterBaseProps } from '@/types/letter.types';
import LetterLayout from './LetterLayout';

interface TerminationLetterProps extends LetterBaseProps {
  terminationDate: string;
  lastWorkingDay: string;
  terminationReason: string;
  severanceDetails?: string;
  benefitsContinuation?: string;
  returnRequirements?: string[];
}

const TerminationLetter: React.FC<TerminationLetterProps> = ({
  company,
  employee,
  date,
  terminationDate,
  lastWorkingDay,
  terminationReason,
  severanceDetails,
  benefitsContinuation,
  returnRequirements
}) => {
  return (
    <LetterLayout company={company} title="Termination Letter">
      <div className="space-y-6 text-gray-700">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="font-semibold text-red-700">CONFIDENTIAL: TERMINATION NOTICE</p>
        </div>

        <div>
          <p>{date}</p>
          <p className="mt-4 font-semibold">{employee.name}</p>
          <p>{employee.address}</p>
        </div>

        <div>
          <p className="font-semibold text-lg mb-4">Dear {employee.name},</p>
          <p className="mb-4">
            This letter is to formally notify you that your employment with {company.name} will be terminated effective <strong>{terminationDate}</strong>. Your last working day will be <strong>{lastWorkingDay}</strong>.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Termination Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Termination Date:</strong> {terminationDate}
              </div>
              <div>
                <strong>Last Working Day:</strong> {lastWorkingDay}
              </div>
              <div className="md:col-span-2">
                <strong>Reason for Termination:</strong> {terminationReason}
              </div>
            </div>
          </div>

          {severanceDetails && (
            <div>
              <h4 className="font-semibold mb-2">Severance Package:</h4>
              <p>{severanceDetails}</p>
            </div>
          )}

          {benefitsContinuation && (
            <div>
              <h4 className="font-semibold mb-2">Benefits Continuation:</h4>
              <p>{benefitsContinuation}</p>
            </div>
          )}

          {returnRequirements && returnRequirements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Company Property Return:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {returnRequirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Final Settlement:</h4>
            <p>Your final settlement including any outstanding salary, bonuses, or other payments will be processed as per company policy and applicable laws.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p>
            We thank you for your contributions during your tenure with {company.name} and wish you success in your future endeavors.
          </p>
        </div>

        <div className="mt-12">
          <p>Sincerely,</p>
          <p className="mt-8 font-semibold">[HR Director Name]</p>
          <p>Human Resources Director</p>
          <p>{company.name}</p>
        </div>
      </div>
    </LetterLayout>
  );
};

export default TerminationLetter;