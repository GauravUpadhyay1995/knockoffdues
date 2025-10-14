import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserData } from '@/types';

interface HealthInfoFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  isSubmitting?: boolean;
}

const HealthInfoFields: React.FC<HealthInfoFieldsProps> = ({
  register,
  errors,
  user,
  isSubmitting,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:hover:bg-gray-500 hover:bg-gray-400 cursor-pointer">
        <input 
          type="checkbox" 
          {...register('hasPreviousInterview')} 
          className="rounded text-blue-600 focus:ring-blue-500" 
        />
        <span>Has Previous Interview</span>
      </label>
      
      <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:hover:bg-gray-500 hover:bg-gray-400 cursor-pointer">
        <input 
          type="checkbox" 
          {...register('isDifferentlyAbled')} 
          className="rounded text-blue-600 focus:ring-blue-500" 
        />
        <span>Differently Abled</span>
      </label>
      
      <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:hover:bg-gray-500 hover:bg-gray-400 cursor-pointer">
        <input 
          type="checkbox" 
          {...register('hasPoliceRecord')} 
          className="rounded text-blue-600 focus:ring-blue-500" 
        />
        <span>Has Police Record</span>
      </label>
      
      <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:hover:bg-gray-500 hover:bg-gray-400 cursor-pointer">
        <input 
          type="checkbox" 
          {...register('hasMajorIllness')} 
          className="rounded text-blue-600 focus:ring-blue-500" 
        />
        <span>Has Major Illness</span>
      </label>
    </div>
  );
};

export default HealthInfoFields;