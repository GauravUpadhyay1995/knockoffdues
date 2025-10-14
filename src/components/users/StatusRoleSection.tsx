import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { UserData } from '@/types';

interface StatusRoleSectionProps {
  user: UserData;
  loggedInUserData: any;
  register: UseFormRegister<UserData>;
  roleList: Array<{ _id: string; role: string }>;
}

const StatusRoleSection: React.FC<StatusRoleSectionProps> = ({
  user,
  loggedInUserData,
  register,
  roleList,
}) => {
  return (
    <div className="mb-6 p-4 bg-red-300 rounded-xl dark:bg-red-800">
      <h3 className="font-medium text-red-800 dark:text-red-300">Status & Role (Critical Zone)</h3>
      <small className='text-red-800 dark:text-red-300 mb-3'>
        (Note: this is sensitive data handle carefully.)
      </small>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              disabled={loggedInUserData?.id === user._id}
              className={`appearance-none h-4 w-4 border rounded border-gray-300 checked:bg-green-600 checked:border-green-600 disabled:checked:bg-green-600 disabled:checked:border-green-600 relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-1 after:w-1.5 after:h-2 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 checked:after:block after:hidden`}
            />
          </label>
          <span className="ml-2 text-red-800 dark:text-red-300">Activated</span>
        </label>

        <div>
          <label className="block text-sm font-medium mb-1 text-red-800 dark:text-red-300">Role</label>
          <select 
            {...register('role')} 
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-red-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"

            disabled={loggedInUserData?.id == user._id}
          >
            {roleList.map((roll) => (
              <option key={roll._id} value={roll.role}>
                {roll.role.charAt(0).toUpperCase() + roll.role.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {user?.role === "lead" && (
          <label className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('isRejected')}
                disabled={loggedInUserData?.id === user._id}
                className={`appearance-none h-4 w-4 border rounded border-gray-300 checked:bg-green-600 checked:border-green-600 disabled:checked:bg-green-600 disabled:checked:border-green-600 relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-1 after:w-1.5 after:h-2 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 checked:after:block after:hidden`}
              />
            </label>
            <span className="ml-2 text-red-800 dark:text-red-300">Is Rejected</span>
          </label>
        )}
        
        {user?.role !== "lead" && (
          <label className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('isVerified')}
                disabled={loggedInUserData?.id === user._id}
                className={`appearance-none h-4 w-4 border rounded border-gray-300 checked:bg-green-600 checked:border-green-600 disabled:checked:bg-green-600 disabled:checked:border-green-600 relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-1 after:w-1.5 after:h-2 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 checked:after:block after:hidden`}
              />
            </label>
            <span className="ml-2 text-red-800 dark:text-red-300">Verify Member</span>
            <small className='ml-2 text-red-800 dark:text-red-100'>
              (If all details have been verified and approved by the authorized panel, the profile will be locked and marked as "Checked." Once a profile is marked as Checked, users will no longer be able to edit or update their information.)
            </small>
          </label>
        )}
      </div>
    </div>
  );
};

export default StatusRoleSection;