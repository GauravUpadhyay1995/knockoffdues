import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { UserData } from '@/types';

interface StatusBadgesProps {
  user: UserData;
}

const StatusBadges: React.FC<StatusBadgesProps> = ({ user }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "green" : "red";
  };

  const getBadgeClass = (color: string) => {
    return `px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400`;
  };

  return (
    <div className="flex flex-wrap gap-2 ml-auto">
      {/* Email Verification Badge */}
      <span className={getBadgeClass(getStatusColor(user?.isEmailVerified || false))}>
        Email {user?.isEmailVerified ? "" : "Not"} Verified 
        {user?.isEmailVerified ? (
          <FiCheck className="inline w-4 h-4 ml-1" />
        ) : (
          <FiX className="inline w-4 h-4 ml-1" />
        )}
      </span>

      {/* Account Activation Badge */}
      <span className={getBadgeClass(getStatusColor(user?.isActive || false))}>
        Account {user?.isActive ? "" : "Not"} Activated 
        {user?.isActive ? (
          <FiCheck className="inline w-4 h-4 ml-1" />
        ) : (
          <FiX className="inline w-4 h-4 ml-1" />
        )}
      </span>

      {/* Account Verification Badge */}
      <span className={getBadgeClass(getStatusColor(user?.isVerified || false))}>
        Account {user?.isVerified ? "" : "Not"} Verified 
        {user?.isVerified ? (
          <FiCheck className="inline w-4 h-4 ml-1" />
        ) : (
          <FiX className="inline w-4 h-4 ml-1" />
        )}
      </span>

      {/* Rejection Status Badge (only for leads) */}
      {user?.role === "lead" && user?.isRejected && (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Rejected Lead
          <FiX className="inline w-4 h-4 ml-1" />
        </span>
      )}

      {/* Fresh Lead Badge */}
      {user?.role === "lead" && !user?.isVerified && !user?.isRejected && (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Fresh Lead
        </span>
      )}
    </div>
  );
};

export default StatusBadges;