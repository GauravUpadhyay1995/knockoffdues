import { useState } from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { UserData } from '@/types';

export const useFormSubmission = (userId: string, user: UserData | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  

  const handleSubmit = async (data: UserData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Helper → append only if value is not empty/undefined/null
      const appendIfValue = (key: string, value: any) => {
        if (
          value !== undefined &&
          value !== null &&
         
          !(typeof value === "number" && isNaN(value))
        ) {
          formData.append(key, value.toString());
        }

      };

      // ------------------ Personal Information ------------------
      appendIfValue("name", data.name);
      appendIfValue("dateOfBirth", data.dateOfBirth);
      
      appendIfValue("position", data.position);
      appendIfValue("jod", data.jod);
      appendIfValue("maritalStatus", data.maritalStatus||"Single");

      // ------------------ Contact Information ------------------
      appendIfValue("email", data.email);
      appendIfValue("officeEmail", data.officeEmail);

      appendIfValue("mobile", data.mobile);
      appendIfValue("permanentAddress", data.permanentAddress);
      appendIfValue("currentAddress", data.currentAddress);

      // ------------------ Professional Information ------------------
      appendIfValue("department", data.department);
      appendIfValue("totalExperience", data.totalExperience?.toString());
      appendIfValue("currentSalary", data.currentSalary?.toString());
      appendIfValue("expectedSalary", data.expectedSalary?.toString());
      appendIfValue("noticePeriodInDays", data.noticePeriodInDays?.toString());
      appendIfValue("careerGap", data.careerGap);

      // ------------------ Family Information ------------------
      appendIfValue("spouseName", data.spouseName);
      appendIfValue("fatherName", data.fatherName);
      appendIfValue("motherName", data.motherName);
      appendIfValue("numberOfSiblings", data.numberOfSiblings?.toString());
      appendIfValue("guardianContact", data.guardianContact);

      // ------------------ Health & Background ------------------
      formData.append("hasPreviousInterview", String(data.hasPreviousInterview || false));
      formData.append("isDifferentlyAbled", String(data.isDifferentlyAbled || false));
      formData.append("hasPoliceRecord", String(data.hasPoliceRecord || false));
      formData.append("hasMajorIllness", String(data.hasMajorIllness || false));

      // ------------------ Recruiter Information ------------------
      appendIfValue("recruiterName", data.recruiterName);
      appendIfValue("referenceId", data.referenceId);

      appendIfValue("joiningDate", data.joiningDate);
      appendIfValue("recruiterComment", data.recruiterComment);

      // ------------------ Academic Qualifications ------------------
      if (Array.isArray(data.academics)) {
        data.academics.forEach((academic, index) => {
          appendIfValue(`academics[${index}][className]`, academic.className);
          appendIfValue(`academics[${index}][university]`, academic.university);
          appendIfValue(`academics[${index}][passingYear]`, academic.passingYear?.toString());
          appendIfValue(`academics[${index}][percentage]`, academic.percentage?.toString());
          formData.append(`academics[${index}][isRegular]`, String(academic.isRegular || false));
          appendIfValue(`academics[${index}][isApproved]`, academic.isApproved);

          if (academic.documentFile?.[0]) {
            // new file uploaded
            formData.append(`academics[${index}][documentFile]`, academic.documentFile[0]);
          } else if (academic.documentUrl) {
            // keep old file if exists
            formData.append(`academics[${index}][documentUrl]`, academic.documentUrl);
          }
        });
      }

      // ------------------ Work Experience ------------------
      if (Array.isArray(data.workExperience)) {
        data.workExperience.forEach((exp, index) => {
          appendIfValue(`workExperience[${index}][designation]`, exp.designation);
          appendIfValue(`workExperience[${index}][companyName]`, exp.companyName);
          appendIfValue(`workExperience[${index}][joiningDate]`, exp.joiningDate);
          appendIfValue(`workExperience[${index}][relievingDate]`, exp.relievingDate);
        });
      }

      // ------------------ Documents ------------------
      if (Array.isArray(data.documents)) {

        data.documents.forEach((doc, index) => {
          appendIfValue(`documents[${index}][documentName]`, doc.documentName);
          appendIfValue(`documents[${index}][isApproved]`, doc.isApproved);
          if (doc.documentFile?.[0]) {
            // new file uploaded
            formData.append(`documents[${index}][documentFile]`, doc.documentFile[0]);
          } else if (doc.documentUrl) {
            // keep old file
            formData.append(`documents[${index}][documentUrl]`, doc.documentUrl);
          }
        });
      }

      // ------------------ Status & Role & Verification ------------------
      formData.append("isActive", String(data.isActive || false));
      appendIfValue("role", data.role || "user");
      formData.append("isVerified", String(data.isVerified || false));
      formData.append("isEmailVerified", String(data.isEmailVerified || false));
      formData.append("isRejected", String(data.isRejected || false));

      // -------------------- Profile Image -----------------
      if (data?.avatar?.[0] && typeof data.avatar[0] === 'object' &&
        'name' in data.avatar[0] && 'size' in data.avatar[0] && 'type' in data.avatar[0]) {
        formData.append("avatar", data.avatar[0]);
      } else if (user?.avatar && typeof user.avatar === "string") {
        formData.append("avatarUrl", user.avatar);
      }

      // ------------------ API Call ------------------
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/update/${user?._id}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      const result = await response.json();

      if (result?.success) {

        toast.success('Profile updated successfully!');
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        toast.error(result?.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSuccess,
    handleSubmit,
  };
};