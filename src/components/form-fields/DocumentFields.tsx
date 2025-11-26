import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import { UserData } from '@/types';

interface DocumentFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  fields: any[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  loggedInUserData: any;
  isSubmitting?: boolean;
}

const DocumentFields: React.FC<DocumentFieldsProps> = ({
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Document Name
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                {...register(`documents.${index}.documentName` as const)}
                className={`w-full px-4 py-3 border rounded-lg dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                placeholder="e.g., Resume, Degree Certificate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-100">
                Document Status
              </label>
              <select 
                {...register(`documents.${index}.isApproved` as const)} 
                         className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"

                disabled={loggedInUserData?.id == user._id}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Upload Document
              </label>
              <input
                disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                {...register(`documents.${index}.documentFile` as const)}
                className={`w-full px-4 py-3 border rounded-lg ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
              />
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
        + Add Document
      </button>
    </div>
  );
};

export default DocumentFields;