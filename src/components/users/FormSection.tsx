import React from 'react';
import { UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import AccordionSection from './AccordionSection';
import PersonalInfoFields from '../form-fields/PersonalInfoFields';
import ContactInfoFields from '../form-fields/ContactInfoFields';
import ProfessionalInfoFields from '../form-fields/ProfessionalInfoFields';
import FamilyInfoFields from '../form-fields/FamilyInfoFields';
import HealthInfoFields from '../form-fields/HealthInfoFields';
import RecruiterInfoFields from '../form-fields/RecruiterInfoFields';
import AcademicFields from '../form-fields/AcademicFields';
import ExperienceFields from '../form-fields/ExperienceFields';
import DocumentFields from '../form-fields/DocumentFields';
import { UserData, AccordionSection as AccordionSectionType } from '@/types';

interface FormSectionProps {
  section: AccordionSectionType;
  isOpen: boolean;
  onToggle: () => void;
  user: UserData;
  loggedInUserData: any;
  register: UseFormRegister<UserData>;
  control: Control<UserData>;
  errors: FieldErrors<UserData>;
  departments: Array<{ _id: string; name: string }>;
  roleList: Array<{ _id: string; role: string }>;
  academicFields?: any[];
  experienceFields?: any[];
  documentFields?: any[];
  appendAcademic?: () => void;
  removeAcademic?: (index: number) => void;
  appendExperience?: () => void;
  removeExperience?: (index: number) => void;
  appendDocument?: () => void;
  removeDocument?: (index: number) => void;
  isSubmitting?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  isOpen,
  onToggle,
  user,
  loggedInUserData,
  register,
  control,
  errors,
  departments,
  roleList,
  academicFields,
  experienceFields,
  documentFields,
  appendAcademic,
  removeAcademic,
  appendExperience,
  removeExperience,
  appendDocument,
  removeDocument,
  isSubmitting,
}) => {
  const renderSectionContent = () => {
    const commonProps = { register, control, errors, user, isSubmitting };
    
    switch (section.id) {
      case 'personal':
        return <PersonalInfoFields {...commonProps} />;
      case 'contact':
        return <ContactInfoFields {...commonProps} loggedInUserData={loggedInUserData} />;
      case 'professional':
        return <ProfessionalInfoFields {...commonProps} departments={departments} />;
      case 'family':
        return <FamilyInfoFields {...commonProps} />;
      case 'health':
        return <HealthInfoFields {...commonProps} />;
      case 'recruiter':
        return <RecruiterInfoFields {...commonProps} />;
      case 'academics':
        return (
          <AcademicFields
            {...commonProps}
            fields={academicFields || []}
            onAppend={appendAcademic}
            onRemove={removeAcademic}
            loggedInUserData={loggedInUserData}
          />
        );
      case 'experience':
        return (
          <ExperienceFields
            {...commonProps}
            fields={experienceFields || []}
            onAppend={appendExperience}
            onRemove={removeExperience}
          />
        );
      case 'documents':
        return (
          <DocumentFields
            {...commonProps}
            fields={documentFields || []}
            onAppend={appendDocument}
            onRemove={removeDocument}
            loggedInUserData={loggedInUserData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AccordionSection
      title={section.title}
      isOpen={isOpen}
      onToggle={onToggle}
      icon={section.icon}
    >
      {renderSectionContent()}
    </AccordionSection>
  );
};

export default FormSection;