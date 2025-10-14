import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { motion } from 'framer-motion';
import { UserData } from '@/types';

interface ExperienceFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  fields: any[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  isSubmitting?: boolean;
}

const ExperienceFields: React.FC<ExperienceFieldsProps> = ({
  register,
  user,
  fields,
  onAppend,
  onRemove,
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
                Designation
              </label>
              <input
                {...register(`workExperience.${index}.designation` as const)}
                className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Software Developer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Company Name
              </label>
              <input
                {...register(`workExperience.${index}.companyName` as const)}
                className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="Company Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Joining Date
              </label>
              <input
                type="date"
                {...register(`workExperience.${index}.joiningDate` as const)}
                defaultValue={
                  user?.workExperience[index]?.joiningDate
                    ? new Date(user?.workExperience[index].joiningDate).toISOString().split('T')[0]
                    : ''
                }
                className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Relieving Date
              </label>
              <input
                type="date"
                {...register(`workExperience.${index}.relievingDate` as const)}
                defaultValue={
                  user?.workExperience[index]?.relievingDate
                    ? new Date(user?.workExperience[index].relievingDate).toISOString().split('T')[0]
                    : ''
                }
                className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
            >
              Remove
            </button>
          </div>
        </motion.div>
      ))}
      
      <button
        type="button"
        onClick={onAppend}
        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
      >
        + Add Work Experience
      </button>
    </div>
  );
};

export default ExperienceFields;