import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserData } from '@/types';

interface ContactInfoFieldsProps {
  register: UseFormRegister<UserData>;
  errors: FieldErrors<UserData>;
  user: UserData;
  loggedInUserData: any;
  isSubmitting?: boolean;
}

const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({
  register,
  errors,
  user,
  loggedInUserData,
  isSubmitting,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Email
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address"
            }
          })}
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
          disabled
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      
      <label className="flex items-center">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            {...register('isEmailVerified')}
            disabled={loggedInUserData?.id === user._id}
            className={`appearance-none h-4 w-4 border rounded border-gray-300 checked:bg-green-600 checked:border-green-600 disabled:checked:bg-green-600 disabled:checked:border-green-600 relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-1 after:w-1.5 after:h-2 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 checked:after:block after:hidden`}
          />
        </label>
        <span className="ml-2 text-red-800 dark:text-red-300">Email Verified</span>
      </label>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Mobile Number
        </label>
        <input
          {...register('mobile', { required: 'Mobile number is required' })}
          placeholder="Mobile Number"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
          disabled
        />
        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
      </div>
      
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Permanent Address
        </label>
        <input
          {...register('permanentAddress')}
          placeholder="Permanent Address"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
      
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Current Address
        </label>
        <input
          {...register('currentAddress')}
          placeholder="Current Address"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
};

export default ContactInfoFields;