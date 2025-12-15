'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDrawer from "@/components/common/ProfileDrawer"
import axios from 'axios';
import { File } from 'buffer';
import { useAuth } from "@/context/AuthContext";
import { FiX, FiCheck, FiEye } from 'react-icons/fi';
type Academic = {
  className: string;
  university: string;
  isRegular: boolean;
  passingYear: number;
  percentage: number;
  documentUrl: string;
  isApproved?: string;
};

type WorkExperience = {
  designation: string;
  companyName: string;
  joiningDate: string;
  relievingDate: string;
  isApproved: string;
};

type Document = {
  documentName: string;
  documentUrl: string;
  isApproved: string;
};

type UserData = {
  name: string;
  email: string;
  mobile: string;
  role: 'admin' | 'user';
  jod?:string;
  isActive: boolean;
  position?: string;
  department?: string;
  dateOfBirth?: string;
  permanentAddress?: string;
  currentAddress?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  spouseName?: string;
  fatherName?: string;
  motherName?: string;
  numberOfSiblings?: number;
  guardianContact?: string;
  recruiterName?: string;
  recruiterComment?: string;
  totalExperience?: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodInDays?: number;
  careerGap?: string;
  hasPreviousInterview?: boolean;
  isDifferentlyAbled?: boolean;
  hasPoliceRecord?: boolean;
  hasMajorIllness?: boolean;
  academics: Academic[];
  workExperience: WorkExperience[];
  documents: Document[];
  avatar?: File;
  isVerified?: boolean,
  isEmailVerified?: boolean,
};

type AccordionSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string; // allow custom classes
};


const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  icon,
  className = "",
}) => (
  <motion.div
    className={`border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-700 ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-800 dark:to-gray-700 transition-all duration-300"
    >
      <div className="flex items-center space-x-3">
        {icon && <span className="text-blue-600">{icon}</span>}
        <span className="font-semibold text-gray-800 dark:text-gray-100 text-left">
          {title}
        </span>
      </div>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-gray-500 dark:text-gray-300 text-lg"
      >
        ▼
      </motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="p-5 bg-white dark:bg-gray-900">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);


// Icons for accordion sections
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const FamilyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const HealthIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const RecruiterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AcademicIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const ExperienceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function UserEditForm() {
  const { updateAdmin } = useAuth();

  const loggedInUserData = JSON.parse(localStorage.getItem('admin'));
  const [profileData, setProfileData] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    contact: false,
    professional: false,
    family: false,
    health: false,
    recruiter: false,
    academics: false,
    experience: false,
    documents: false,
  });

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<UserData>({
    defaultValues: {
      academics: [{
        className: '',
        university: '',
        isRegular: false,
        passingYear: new Date().getFullYear(),
        percentage: 0,
        // change from URL string → file placeholder
        documentFile: undefined as File | undefined,
      }],
      workExperience: [{
        designation: '',
        companyName: '',
        joiningDate: '',
        relievingDate: '',
      }],
      documents: [{
        documentName: '',
        // same here → actual file instead of URL
        documentFile: undefined as File | undefined,
      }],
      avatar: undefined as File | undefined,
    }
  });


  const { fields: academicFields, append: appendAcademic, remove: removeAcademic } = useFieldArray({
    control,
    name: "academics"
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "workExperience"
  });

  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control,
    name: "documents"
  });
  // inside your component
  const avatarFile = watch("avatar");
  const [preview, setPreview] = useState<string>(user?.avatar || "/images/logo/logo.png");

  useEffect(() => {
    let objectUrl: string | null = null;

    if (avatarFile instanceof FileList && avatarFile.length > 0) {
      objectUrl = URL.createObjectURL(avatarFile[0]);
      setPreview(objectUrl);
    } else if (typeof avatarFile === "string") {
      setPreview(avatarFile);
    } else if (!avatarFile) {
      setPreview(user?.avatar || "/images/logo/logo.png");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile, user]);


  useEffect(() => {
    const fetchUser = async () => {
      // Simulate API call
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/login`);

      setTimeout(() => {
        const mockUser = response.data.data;
        setProfileData({
          resume: mockUser?.resume,
          photo: mockUser?.avatar,
        });
        setUser(mockUser);
        reset(mockUser);
      }, 800);
    };
    fetchUser();
  }, [reset]);

  const onSubmit = async (data: UserData) => {
    
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Helper → append only if value is not empty/undefined/null
      const appendIfValue = (key: string, value: any) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(typeof value === "number" && isNaN(value))
        ) {
          formData.append(key, value);
        }
      };

      // ------------------ Personal Information ------------------
      appendIfValue("name", data.name);
      appendIfValue("dateOfBirth", data.dateOfBirth);
      appendIfValue("position", data.position);
      appendIfValue("maritalStatus", data.maritalStatus||"Single");
      appendIfValue("jod", data.jod);


      // ------------------ Contact Information ------------------
      appendIfValue("email", data.email);
      appendIfValue("mobile", data.mobile);
      appendIfValue("permanentAddress", data.permanentAddress);
      appendIfValue("currentAddress", data.currentAddress);

      // ------------------ Professional Information ------------------
  
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
      appendIfValue("recruiterComment", data.recruiterComment);

      // ------------------ Academic Qualifications ------------------
      data.academics.forEach((academic, index) => {
        appendIfValue(`academics[${index}][className]`, academic.className);
        appendIfValue(`academics[${index}][university]`, academic.university);
        appendIfValue(`academics[${index}][passingYear]`, academic.passingYear?.toString());
        appendIfValue(`academics[${index}][percentage]`, academic.percentage?.toString());
        formData.append(`academics[${index}][isRegular]`, String(academic.isRegular || false));
        formData.append(`academics[${index}][isApproved]`, String(academic.isApproved || false));

        if (academic.documentFile?.[0]) {
          // new file uploaded
          formData.append(`academics[${index}][documentFile]`, academic.documentFile[0]);
        } else if (academic.documentUrl) {
          // keep old file if exists
          formData.append(`academics[${index}][documentUrl]`, academic.documentUrl);
        }
      });

      // ------------------ Work Experience ------------------
      data.workExperience.forEach((exp, index) => {
        appendIfValue(`workExperience[${index}][designation]`, exp.designation);
        appendIfValue(`workExperience[${index}][companyName]`, exp.companyName);
        appendIfValue(`workExperience[${index}][joiningDate]`, exp.joiningDate);
        appendIfValue(`workExperience[${index}][relievingDate]`, exp.relievingDate);
      });

      // ------------------ Documents ------------------
      data.documents.forEach((doc, index) => {
        appendIfValue(`documents[${index}][documentName]`, doc.documentName);
        formData.append(`documents[${index}][isApproved]`, String(doc.isApproved || false));

        if (doc.documentFile?.[0]) {
          // new file uploaded
          formData.append(`documents[${index}][documentFile]`, doc.documentFile[0]);
        } else if (doc.documentUrl) {
          // keep old file
          formData.append(`documents[${index}][documentUrl]`, doc.documentUrl);
        }
      });

      // ------------------ Status & Role ------------------
      formData.append("isActive", String(data.isActive || false));
      appendIfValue("role", data.role || "user");



      //--------------------Profile Image-----------------
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
        // ✅ Update state & reset form with new data
        updateAdmin({
          avatar: result?.data?.avatar,
          name: result?.data?.name
        });
        setUser(result?.data);
        reset(result.data);
        setSubmitSuccess(true);
        setIsSubmitting(false);
      } else {
        setError(result?.message || "Failed to update user");
      }
      // setIsSubmitting(false);
      // setSubmitSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-8xl mx-auto p-4 md:p-6"
    >
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-20 right-6 items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Content */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{user?.name}`s Profile</h2>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                Update {user?.name}`s information and preferences
              </p>
            </div>

            {/* Right Badges */}
            <div className="flex flex-wrap gap-2 ml-auto">
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${user?.isEmailVerified ? "green" : "red"}-100 text-${user?.isEmailVerified ? "green" : "red"}-800 dark:bg-${user?.isEmailVerified ? "green" : "red"}-900/30 dark:text-${user?.isEmailVerified ? "green" : "red"}-400`}>
                Email {user?.isEmailVerified ? "" : "Not"} Verified {user?.isEmailVerified ? <FiCheck className="inline w-4 h-4" /> : <FiX className="inline w-4 h-4" />}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${user?.isActive ? "green" : "red"}-100 text-${user?.isActive ? "green" : "red"}-800 dark:bg-${user?.isActive ? "green" : "red"}-900/30 dark:text-${user?.isActive ? "green" : "red"}-400`}>
                Account {user?.isActive ? "" : "Not"} Activated {user?.isActive ? <FiCheck className="inline w-4 h-4" /> : <FiX className="inline w-4 h-4" />}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${user?.isVerified ? "green" : "red"}-100 text-${user?.isVerified ? "green" : "red"}-800 dark:bg-${user?.isVerified ? "green" : "red"}-900/30 dark:text-${user?.isVerified ? "green" : "red"}-400`}>
                Account {user?.isVerified ? "" : "Not"}Verified {user?.isVerified ? <FiCheck className="inline w-4 h-4" /> : <FiX className="inline w-4 h-4" />}
              </span>
            </div>
          </div>
        </div>


        <form onSubmit={handleSubmit(onSubmit)} className="p-6 dark:bg-gray-900 dark:border-gray-700">
          {/* Personal Information */}
          <AccordionSection
            title="Personal Information"
            isOpen={openSections.personal}
            onToggle={() => toggleSection('personal')}
            icon={<UserIcon />}
            className="dark:bg-gray-900 dark:border-gray-700"

          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
              {/* Left side: 75% (3/4 columns) */}
              <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Full Name</label>
                  <input disabled={isSubmitting || user.isVerified}
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                    placeholder="Full Name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Date of Birth</label>
                  <input disabled={isSubmitting || user.isVerified}
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Position</label>
                  <input disabled={isSubmitting || user.isVerified}
                    {...register('position')}
                    placeholder="Position"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className=" dark:text-white block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Canditate Joining Date</label>
                  <input
                    {...register('jod')}
                    placeholder="Candidate Joining Date"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Marital Status</label>
                  <select disabled={isSubmitting || user.isVerified} {...register('maritalStatus')} className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              {/* Right side: 25% (1/4 column) */}
              {/* Right side: 25% (1/4 column) */}
              <div className="col-span-1 flex flex-col items-center">
                <label
                  htmlFor="avatar"
                  className="cursor-pointer relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center hover:opacity-80 transition"
                >
                  {/* Profile Image Preview */}
                  <img
                    src={preview}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />


                  {/* Hidden File Input */}
                  <input disabled={isSubmitting || user.isVerified}
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("avatar")}
                  />
                </label>

                <p className="mt-2 text-sm text-gray-500">Click to change</p>
              </div>


            </div>
          </AccordionSection>


          {/* Contact Information */}
          <AccordionSection
            title="Contact Information"
            isOpen={openSections.contact}
            onToggle={() => toggleSection('contact')}
            icon={<ContactIcon />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
                <input disabled={isSubmitting || user.isVerified}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Mobile Number</label>
                <input disabled={isSubmitting || user.isVerified}
                  {...register('mobile', { required: 'Mobile number is required' })}
                  placeholder="Mobile Number"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  disabled
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Permanent Address</label>
                <input disabled={isSubmitting || user.isVerified}
                  {...register('permanentAddress')}
                  placeholder="Permanent Address"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Current Address</label>
                <input disabled={isSubmitting || user.isVerified}
                  {...register('currentAddress')}
                  placeholder="Current Address"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Professional Information */}
          <AccordionSection
            title="Professional Information"
            isOpen={openSections.professional}
            onToggle={() => toggleSection('professional')}
            icon={<BriefcaseIcon />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Department</label>
                <input disabled={true}
                  {...register('department.department')}
                  placeholder="Department"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Total Experience (years)</label>
                <input disabled={isSubmitting || user.isVerified}
                  {...register('totalExperience')}
                  type="number"
                  placeholder="Total Experience"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Current Salary</label>
                <input disabled={isSubmitting || user.isVerified}
                  {...register('currentSalary')}
                  type="number"
                  placeholder="Current Salary"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Expected Salary</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('expectedSalary')}
                  type="number"
                  placeholder="Expected Salary"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Notice Period (days)</label>
                <input
                  {...register('noticePeriodInDays')}
                  type="number"
                  placeholder="Notice Period"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Career Gap (if any)</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('careerGap')}
                  placeholder="Career Gap"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Family Information */}
          <AccordionSection
            title="Family Information"
            isOpen={openSections.family}
            onToggle={() => toggleSection('family')}
            icon={<FamilyIcon />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Spouse Name</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('spouseName')}
                  placeholder="Spouse Name"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Father's Name</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('fatherName')}
                  placeholder="Father's Name"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Mother's Name</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('motherName')}
                  placeholder="Mother's Name"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Number of Siblings</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('numberOfSiblings')}
                  type="number"
                  placeholder="No. of Siblings"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Guardian Contact</label>
                <input
                  disabled={isSubmitting || user.isVerified}
                  {...register('guardianContact')}
                  placeholder="Guardian Contact"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Health & Background */}
          <AccordionSection
            title="Health & Background"
            isOpen={openSections.health}
            onToggle={() => toggleSection('health')}
            icon={<HealthIcon />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200  dark:hover:bg-gray-500 hover:bg-gray-400  cursor-pointer">
                <input disabled={isSubmitting || user.isVerified} type="checkbox" {...register('hasPreviousInterview')} className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Has Previous Interview</span>
              </label>
              <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200  dark:hover:bg-gray-500 hover:bg-gray-400  cursor-pointer">
                <input disabled={isSubmitting || user.isVerified} type="checkbox" {...register('isDifferentlyAbled')} className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Differently Abled</span>
              </label>
              <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:hover:bg-gray-500 hover:bg-gray-400  cursor-pointer">
                <input disabled={isSubmitting || user.isVerified} type="checkbox" {...register('hasPoliceRecord')} className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Has Police Record</span>
              </label>
              <label className="dark:bg-gray-800 dark:text-white flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:hover:bg-gray-500 hover:bg-gray-400  cursor-pointer">
                <input disabled={isSubmitting || user.isVerified} type="checkbox" {...register('hasMajorIllness')} className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Has Major Illness</span>
              </label>
            </div>
          </AccordionSection>

          {/* Recruiter Information */}
          {/* <AccordionSection
            title="Recruiter Information"
            isOpen={openSections.recruiter}
            onToggle={() => toggleSection('recruiter')}
            icon={<RecruiterIcon />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div>
                <label className="dark:bg-gray-800 dark:text-white block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Recruiter Name</label>
                <input
                  {...register('recruiterName')}
                  placeholder="Recruiter Name"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Recruiter Comment</label>
                <textarea
                  {...register('recruiterComment')}
                  placeholder="Recruiter Comment"
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </AccordionSection> */}

          {/* Academic Qualifications */}
          <AccordionSection
            title="Academic Qualifications"
            isOpen={openSections.academics}
            onToggle={() => toggleSection('academics')}
            icon={<AcademicIcon />}
          >
            <div className="space-y-4 ">
              {academicFields.map((field, index) => (
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
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Class/Course Name</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        {...register(`academics.${index}.className` as const)}
                        className={`w-full px-4 py-3 border rounded-lg  dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                        placeholder="e.g., Bachelor of Technology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">University/Institution</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        {...register(`academics.${index}.university` as const)}
                        className={`w-full px-4 py-3 border rounded-lg  dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Passing Year</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        type="number"
                        {...register(`academics.${index}.passingYear` as const, { valueAsNumber: true })}
                        className={`w-full px-4 py-3 border rounded-lg  dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                        placeholder="YYYY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Percentage/CGPA</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        type="number"
                        step="0.01"
                        {...register(`academics.${index}.percentage` as const, { valueAsNumber: true })}
                        className={`w-full px-4 py-3 border rounded-lg  dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                        placeholder="Percentage or CGPA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Upload Document</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        {...register(`academics.${index}.documentFile` as const)}
                        className={`w-full px-4 py-3 border rounded-lg  dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                      />
                    </div>




                    <div className="flex items-center justify-end md:justify-start">
                      <label className="flex items-center space-x-2 mt-6 dark:bg-gray-800 dark:text-white">
                        <input
                          disabled={isSubmitting || user.isVerified || field?.isApproved === "approved"}
                          type="checkbox"
                          {...register(`academics.${index}.isRegular` as const)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Regular Course</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    {field.documentUrl && (
                      <>
                        <a
                          href={field.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-2 inline-flex items-center gap-2 px-3 py-1.5             rounded-lg text-xs font-medium              bg-green-100 text-green-700              hover:bg-green-200 hover:scale-105 hover:shadow-md             transition-all duration-300 ease-out"
                        >
                          <FiEye className='w-4 h-4' />  View File
                        </a>
                        {field?.isApproved && (
                          <span className={`mr-2 inline-flex items-center gap-2 px-3 py-1.5  rounded-lg text-xs font-medium              bg-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-100 text-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-700              hover:bg-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-200 hover:scale-105 hover:shadow-md             transition-all duration-300 ease-out`}>
                            {field?.isApproved == "pending" ? <FiEye className='w-4 h-4' /> : field?.isApproved == "approved" ? <FiCheck className='w-4 h-4' /> : <FiX className='w-4 h-4' />}
                            {field.isApproved.charAt(0).toUpperCase() + field.isApproved.slice(1)}
                          </span>

                        )}


                      </>


                    )}

                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={isSubmitting || user.isVerified || field?.isApproved === "approved"}
                      type="button"
                      onClick={() => removeAcademic(index)}
                      className={`px-3 py-1  bg-red-100 ${field?.isApproved == "approved" ? "cursor-not-allowed" : ""} text-red-700 rounded-md hover:bg-red-200 text-sm`}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
              <button
                disabled={isSubmitting || user.isVerified}
                type="button"
                onClick={() => appendAcademic({ className: '', university: '', isRegular: false, passingYear: new Date().getFullYear(), percentage: 0, documentUrl: '' })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
              >
                + Add Academic Qualification
              </button>
            </div>
          </AccordionSection>

          {/* Work Experience */}
          <AccordionSection
            title="Work Experience"
            isOpen={openSections.experience}
            onToggle={() => toggleSection('experience')}
            icon={<ExperienceIcon />}
          >
            <div className="space-y-4">
              {experienceFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50  dark:bg-gray-800"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Designation</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        {...register(`workExperience.${index}.designation` as const)}
                        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Software Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Company Name</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        {...register(`workExperience.${index}.companyName` as const)}
                        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Joining Date</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        type="date"
                        {...register(`workExperience.${index}.joiningDate` as const)}
                        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Relieving Date</label>
                      <input
                        disabled={isSubmitting || user.isVerified}
                        type="date"
                        {...register(`workExperience.${index}.relievingDate` as const)}
                        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={isSubmitting || user.isVerified}
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
              <button
                disabled={isSubmitting || user.isVerified}
                type="button"
                onClick={() => appendExperience({ designation: '', companyName: '', joiningDate: '', relievingDate: '' })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
              >
                + Add Work Experience
              </button>
            </div>
          </AccordionSection>

          {/* Documents */}
          <AccordionSection
            title="Documents"
            isOpen={openSections.documents}
            onToggle={() => toggleSection('documents')}
            icon={<DocumentIcon />}
          >
            <div className="space-y-4">
              {documentFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50  dark:bg-gray-800"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Document Name</label>
                      <input
                        disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                        {...register(`documents.${index}.documentName` as const)}
                        className={`w-full px-4 py-3 border rounded-lg  dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"}`}
                        placeholder="e.g., Resume, Degree Certificate"
                      />
                    </div>
                    <div className='hidden'>
                      <label className="block text-sm font-medium   mb-1 text-red-800 dark:text-red-300 ">Document Status</label>
                      <select  {...register(`documents.${index}.isApproved` as const)} className="input-field w-auto bg-red-300 text-red-800 dark:bg-red-800 dark:text-red-300" disabled={loggedInUserData?.id == user._id}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>

                      </select>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">

                      </label>

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Upload Document</label>
                      <input
                        disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        {...register(`documents.${index}.documentFile` as const)}
                        className={`w-full px-4 py-3 border rounded-lg  ${field?.isApproved == "approved" ? "cursor-not-allowed bg-gray-100 dark:bg-gray-900" : "bg-white"} dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500`}
                      />
                    </div>


                  </div>
                  <div className="flex justify-start">
                    {field.documentUrl && (
                      <>
                        <a
                          href={field.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-2 inline-flex items-center gap-2 px-3 py-1.5             rounded-lg text-xs font-medium              bg-green-100 text-green-700              hover:bg-green-200 hover:scale-105 hover:shadow-md             transition-all duration-300 ease-out"
                        >
                          <FiEye className='w-4 h-4' />  View File
                        </a>
                        {field?.isApproved && (
                          <span className={`mr-2 inline-flex items-center gap-2 px-3 py-1.5  rounded-lg text-xs font-medium              bg-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-100 text-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-700              hover:bg-${field?.isApproved == "pending" ? "yellow" : field?.isApproved == "approved" ? "green" : "red"}-200 hover:scale-105 hover:shadow-md             transition-all duration-300 ease-out`}>
                            {field?.isApproved == "pending" ? <FiEye className='w-4 h-4' /> : field?.isApproved == "approved" ? <FiCheck className='w-4 h-4' /> : <FiX className='w-4 h-4' />}
                            {field.isApproved.charAt(0).toUpperCase() + field.isApproved.slice(1)}
                          </span>

                        )}


                      </>


                    )}

                  </div>
                  <div className="flex justify-end">

                    <button
                      disabled={isSubmitting || user.isVerified || field?.isApproved == "approved"}
                      type="button"
                      onClick={() => removeDocument(index)}
                      className={`px-3 py-1  bg-red-100 ${field?.isApproved == "approved" ? "cursor-not-allowed" : ""} text-red-700 rounded-md hover:bg-red-200 text-sm`}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
              <button
                disabled={isSubmitting || user.isVerified}
                type="button"
                onClick={() => appendDocument({ documentName: '', documentUrl: '' })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
              >
                + Add Document
              </button>
            </div>
          </AccordionSection>

          {/* Status and Role */}
          {/* <div className="mb-6 p-4 bg-gray-50 rounded-xl  dark:bg-gray-800">
            <h3 className="font-medium text-gray-800 mb-3 dark:text-gray-300">Status & Role</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    disabled={loggedInUserData?.id === user._id}
                    className={`appearance-none h-4 w-4 border rounded border-gray-300 checked:bg-green-600 hecked:border-green-600 disabled:checked:bg-green-600 disabled:checked:border-green-600      relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-1 after:w-1.5 after:h-2 after:border-r-2 after:border-b-2 after:border-white after:rotate-45      checked:after:block after:hidden`}
                  />
                </label>


                <span className="ml-2 text-gray-700 dark:text-gray-300">Active User</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300 ">User Role</label>
                <select {...register('role')} className="input-field w-auto dark:text-gray-300" disabled={loggedInUserData?.id == user._id}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div> */}

          {/* Submit Button */}



          <div className="flex justify-end mt-8 space-x-4">

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-6 right-6 px-6 py-3 bg-orange-500 text-white font-medium                rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400   disabled:opacity-70 flex items-center " >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                               5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                               5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update
                </>
              )}
            </motion.button>

          </div>

        </form>
        {profileData && <ProfileDrawer data={profileData} />}

      </motion.div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.6rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </motion.div>
  );
}