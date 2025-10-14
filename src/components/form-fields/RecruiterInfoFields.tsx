import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserData } from '@/types';

interface RecruiterInfoFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  isSubmitting?: boolean;
}

const RecruiterInfoFields: React.FC<RecruiterInfoFieldsProps> = ({
  register,
  errors,
  user,
  isSubmitting,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="dark:text-white block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Recruiter Name
        </label>
        <input
          {...register('recruiterName')}
          placeholder="Recruiter Name"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Recruiter Comment
        </label>
        <textarea
          {...register('recruiterComment')}
          placeholder="Recruiter Comment"
          rows={3}
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
};

export default RecruiterInfoFields;