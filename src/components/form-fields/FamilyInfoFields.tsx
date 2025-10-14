import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserData } from '../../types';

interface FamilyInfoFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  isSubmitting?: boolean;
}

const FamilyInfoFields: React.FC<FamilyInfoFieldsProps> = ({
  register,
  errors,
  user,
  isSubmitting,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Spouse Name
        </label>
        <input
          {...register('spouseName')}
          placeholder="Spouse Name"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Father's Name
        </label>
        <input
          {...register('fatherName')}
          placeholder="Father's Name"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Mother's Name
        </label>
        <input
          {...register('motherName')}
          placeholder="Mother's Name"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Number of Siblings
        </label>
        <input
          {...register('numberOfSiblings')}
          type="number"
          placeholder="No. of Siblings"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Guardian Contact
        </label>
        <input
          {...register('guardianContact')}
          placeholder="Guardian Contact"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
};

export default FamilyInfoFields;