import React from 'react';
import { UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import { UserData, Academic } from '@/types';

interface AcademicFieldsProps {
  register: UseFormRegister<UserData>;
  control: Control<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  fields: any[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  loggedInUserData: any;
  isSubmitting?: boolean;
}

const AcademicFields: React.FC<AcademicFieldsProps> = ({
  register,
  user,
  fields,
  onAppend,
  onRemove,
  loggedInUserData,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <motion.div
          key={field.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Class/Course Name
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                {...register(`academics.${index}.className` as const)}
                className={`w-full px-4 py-3 border rounded-lg ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
                placeholder="e.g., Bachelor of Technology"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                University/Institution
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                {...register(`academics.${index}.university` as const)}
                className={`w-full px-4 py-3 border rounded-lg ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
                placeholder="University Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Passing Year
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                type="number"
                {...register(`academics.${index}.passingYear` as const, { valueAsNumber: true })}
                className={`w-full px-4 py-3 border rounded-lg ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
                placeholder="YYYY"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Percentage/CGPA
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                type="number"
                step="0.01"
                {...register(`academics.${index}.percentage` as const, { valueAsNumber: true })}
                className={`w-full px-4 py-3 border rounded-lg ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
                placeholder="Percentage or CGPA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Upload Document
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                {...register(`academics.${index}.documentFile` as const)}
                className={`w-full px-4 py-3 border rounded-lg ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300">
                Document Status
              </label>
              <select 
                {...register(`academics.${index}.isApproved` as const)} 
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                disabled={loggedInUserData?.id == user._id}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center justify-end md:justify-start">
              <label className="flex items-center space-x-2 mt-6 dark:bg-gray-800 dark:text-white">
                <input
                  disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                  type="checkbox"
                  {...register(`academics.${index}.isRegular` as const)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Regular Course</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-start">
            {field.documentUrl && (
              <>
                <a
                  href={field.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 hover:shadow-md transition-all duration-300 ease-out"
                >
                  <FiEye className='w-4 h-4' /> View File
                </a>
                {field?.isApproved && (
                  <span className={`mr-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-100 text-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-700 hover:bg-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-200 hover:scale-105 hover:shadow-md transition-all duration-300 ease-out`}>
                    {field?.isApproved == "pending" ? <FiEye className='w-4 h-4' /> : field?.isApproved == "approved" ? <FiCheck className='w-4 h-4' /> : <FiX className='w-4 h-4' />}
                    {field.isApproved.charAt(0).toUpperCase() + field.isApproved.slice(1)}
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
              type="button"
              onClick={() => onRemove(index)}
              className={`px-3 py-1 bg-red-100 ${field?.isApproved == "approved" ? "cursor-not-allowed" : ""} text-red-700 rounded-md hover:bg-red-200 text-sm`}
            >
              Remove
            </button>
          </div>
        </motion.div>
      ))}
      
      <button
      disabled={isSubmitting || user.isVerified}
        type="button"
        onClick={onAppend}
        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
      >
        + Add Academic Qualification
      </button>
    </div>
  );
};

export default AcademicFields;