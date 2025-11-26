export type Academic = {
  className: string;
  university: string;
  isRegular: boolean;
  passingYear: number;
  percentage: number;
  documentUrl: string;
  isApproved: string;
  documentFile?: FileList;
};

export type WorkExperience = {
  designation: string;
  companyName: string;
  joiningDate: string;
  relievingDate: string;
};

export type Document = {
  documentName: string;
  documentUrl: string;
  isApproved: string;
  documentFile?: FileList;
};

export type UserData = {
  _id?: string;
  name: string;
  email: string;
  officeEmail?: string;
  mobile: string;
  role: string;
  jod?: string;
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
  joiningDate?: string;
  recruiterComment?: string;
  referenceId?: string;
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
  avatar?: FileList;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  isRejected?: boolean;
  resume?: string;
};

export type AccordionSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
};