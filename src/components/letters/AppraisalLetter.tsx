// components/letters/AppraisalLetter.tsx
import React from 'react';
import { LetterBaseProps } from '@/types/letter.types';
import LetterLayout from './LetterLayout';

interface PerformanceMetric {
  category: string;
  rating: number;
  comments: string;
}

interface AppraisalLetterProps extends LetterBaseProps {
  appraisalPeriod: string;
  overallRating: number;
  performanceMetrics: PerformanceMetric[];
  newSalary: string;
  previousSalary?: string;
  effectiveDate: string;
  bonus?: string;
  goals: string[];
}

const AppraisalLetter = ({ employeeData }: { employeeData: any }) => {
  const getRatingDescription = (rating: number) => {
    if (rating >= 4.5) return 'Exceptional';
    if (rating >= 4) return 'Exceeds Expectations';
    if (rating >= 3) return 'Meets Expectations';
    if (rating >= 2) return 'Needs Improvement';
    return 'Unsatisfactory';
  };
  const overallRating = 4.5;
  const previousSalary = employeeData?.currentSalary;
  const newSalary = (parseFloat(employeeData?.currentSalary) * 1.1).toFixed(2); // Example: 10% increase
  const performanceMetrics: PerformanceMetric[] = [
    { category: 'Quality of Work', rating: 4.5, comments: 'Consistently delivers high-quality work with attention to detail.' },
    { category: 'Productivity', rating: 4.0, comments: 'Meets deadlines and manages time effectively.' },
    { category: 'Teamwork', rating: 5.0, comments: 'Excellent collaboration and support for team members.' },
    { category: 'Communication', rating: 4.0, comments: 'Communicates clearly and effectively with colleagues and clients.' },
    { category: 'Problem-Solving', rating: 4.5, comments: 'Demonstrates strong analytical skills and resourcefulness.' },
  ];
  const effectiveDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const bonus = '₹5,000'; // Example bonus
  const goals = [
    'Enhance leadership skills through training and mentorship.',
    'Increase sales targets by 15% in the next quarter.',
    'Improve customer satisfaction ratings by implementing feedback mechanisms.'

  ];

  return (
    <LetterLayout title="Performance Appraisal">
      <div className="space-y-6 text-gray-700">
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <p className="font-semibold text-green-700">CONFIDENTIAL: PERFORMANCE APPRAISAL</p>
        </div>

        {/* <div>
          <p>{date}</p>
          <p className="mt-4 font-semibold">{employeeData?.name}</p>
          <p>{employeeData?.address}</p>
        </div> */}

        <div>
          <p className="font-semibold text-lg mb-4">Dear {employeeData?.name},</p>
          <p className="mb-4">
            We are pleased to present your performance appraisal for the period <strong>1 year</strong>. This letter summarizes your achievements, areas for development, and compensation adjustments.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4 text-center">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded shadow-sm">
                <p className="text-3xl font-bold text-blue-600">{overallRating}/5.0</p>
                <p className="text-sm text-gray-600">Overall Rating</p>
              </div>
              <div className="bg-white p-4 rounded shadow-sm">
                <p className="text-xl font-bold text-green-600">{getRatingDescription(overallRating)}</p>
                <p className="text-sm text-gray-600">Performance Level</p>
              </div>
              <div className="bg-white p-4 rounded shadow-sm">
                <p className="text-lg font-bold text-purple-600">{newSalary}</p>
                <p className="text-sm text-gray-600">New Salary</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Performance Metrics:</h4>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex justify-between items-start">
                    <strong>{metric.category}</strong>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {metric.rating}/5.0
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">{metric.comments}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Compensation Details</h4>
              <div className="space-y-2">
                {previousSalary && (
                  <p><strong>Previous Salary:</strong> {previousSalary}</p>
                )}
                <p><strong>New Salary:</strong> {newSalary}</p>
                <p><strong>Effective Date:</strong> {effectiveDate}</p>
                {bonus && (
                  <p><strong>Performance Bonus:</strong> {bonus}</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Goals for Next Period</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {goals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p>
            We appreciate your dedication and valuable contributions. Your efforts have been instrumental in our success, and we look forward to your continued growth with the organization.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <div>
            <p>Sincerely,</p>
            <p className="mt-8 font-semibold">[Manager Name]</p>
            <p>Department Manager</p>

          </div>

          <div className="border-t-2 border-gray-300 pt-8">
            <p className="font-semibold">Employee Acknowledgment</p>
            <p className="mt-4">I have reviewed and discussed this performance appraisal with my manager.</p>

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

export default AppraisalLetter;