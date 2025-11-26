import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserData } from '@/types';

interface RecruiterInfoFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  referenceList: any[];
  isSubmitting?: boolean;
}

const RecruiterInfoFields: React.FC<RecruiterInfoFieldsProps> = ({
  register,
  errors,
  user,
  referenceList,
  isSubmitting,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* reference info */}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">  Reference Person</label>
        <select
          {...register('referenceId')}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"

        >
          <option value="null">Select User</option>
          {referenceList.map((roll) => (
            <option key={roll._id} value={roll._id}  disabled={roll._id === user._id}  >
              {roll.name.charAt(0).toUpperCase() + roll.name.slice(1)}-({roll.emp_id})-
              {roll.email}
            </option>
          ))}
        </select>
      </div>




      {/* recruiter info */}

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

      <div >
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