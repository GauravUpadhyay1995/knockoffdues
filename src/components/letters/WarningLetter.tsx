// components/letters/WarningLetter.tsx
import React from 'react';
import { LetterBaseProps } from '@/types/letter.types';
import LetterLayout from './LetterLayout';

interface WarningLetterProps extends LetterBaseProps {
  issue: string;
  incidentDate: string;
  policyViolation: string;
  expectations: string[];
  consequences: string[];
  reviewPeriod: string;
}

const WarningLetter: React.FC<WarningLetterProps> = ({
  company,
  employee,
  date,
  issue,
  incidentDate,
  policyViolation,
  expectations,
  consequences,
  reviewPeriod
}) => {
  return (
    <LetterLayout company={company} title="Formal Warning Letter">
      <div className="space-y-6 text-gray-700">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="font-semibold text-red-700">CONFIDENTIAL: FORMAL WARNING</p>
        </div>

        <div>
          <p>{date}</p>
          <p className="mt-4 font-semibold">{employee.name}</p>
          <p>{employee.address}</p>
        </div>

        <div>
          <p className="font-semibold text-lg mb-4">Dear {employee.name},</p>
          <p className="mb-4">
            This letter serves as a formal written warning regarding your recent conduct and performance issues. We take these matters seriously and want to provide you with clear expectations for improvement.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Issue Summary</h3>
            <p><strong>Date of Incident:</strong> {incidentDate}</p>
            <p className="mt-2"><strong>Policy Violation:</strong> {policyViolation}</p>
            <p className="mt-2"><strong>Specific Issue:</strong> {issue}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Expectations for Improvement:</h4>
            <ul className="list-disc list-inside ml-4 space-y-2">
              {expectations.map((expectation, index) => (
                <li key={index}>{expectation}</li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-red-700">Consequences of Non-Improvement:</h4>
            <ul className="list-disc list-inside ml-4 space-y-1">
              {consequences.map((consequence, index) => (
                <li key={index}>{consequence}</li>
              ))}
            </ul>
          </div>

          <div>
            <p>
              <strong>Review Period:</strong> Your performance and conduct will be reviewed on <strong>{reviewPeriod}</strong>. Failure to demonstrate significant improvement may result in further disciplinary action, up to and including termination of employment.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p>
            We value you as an employee and want to see you succeed at {company.name}. If you have any questions or need clarification regarding these expectations, please schedule a meeting with your manager or HR representative.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <div>
            <p>Sincerely,</p>
            <p className="mt-8 font-semibold">[Manager Name]</p>
            <p>Department Manager</p>
            <p>{company.name}</p>
          </div>

          <div className="border-t-2 border-gray-300 pt-8">
            <p className="font-semibold">Employee Acknowledgment</p>
            <p className="mt-4">I have received and understand this formal warning letter.</p>
            
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <p className="border-b border-gray-300 pb-2">Signature</p>
                <p className="text-sm text-gray-500 mt-1">Employee</p>
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

export default WarningLetter;