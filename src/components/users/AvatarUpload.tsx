import React, { useEffect, useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { UserData } from '@/types/index';

interface AvatarUploadProps {
  register: UseFormRegister<UserData>;
  user: UserData;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ register, user }) => {
  const [preview, setPreview] = useState<string>(user?.avatar || "/images/logo/logo.png");

  useEffect(() => {
    setPreview(user?.avatar || "/images/logo/logo.png");
  }, [user?.avatar]);

  return (
    <div className="col-span-1 flex flex-col items-center">
      <label
        htmlFor="avatar"
        className="cursor-pointer relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center hover:opacity-80 transition"
      >
        <img
          src={preview}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover"
        />
        <input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          {...register("avatar")}
        />
      </label>
      <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">Click to change</p>
    </div>
  );
};

export default AvatarUpload;