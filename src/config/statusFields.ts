export const statusFieldsConfig = {
  criticalFields: [
    {
      name: 'isActive',
      label: 'Activated',
      description: 'Activate or deactivate user account',
    },
    {
      name: 'role',
      label: 'Role',
      description: 'User role in the system',
    },
    {
      name: 'isVerified',
      label: 'Verify Member',
      description: 'If all details have been verified and approved by the authorized panel, the profile will be locked and marked as "Checked." Once a profile is marked as Checked, users will no longer be able to edit or update their information.',
    },
    {
      name: 'isRejected',
      label: 'Is Rejected',
      description: 'Mark lead as rejected',
    },
  ],
  
  verificationFields: [
    {
      name: 'isEmailVerified',
      label: 'Email Verified',
      description: 'Mark email as verified',
    },
  ],
  
  getFieldConfig: (fieldName: string) => {
    return statusFieldsConfig.criticalFields.find(field => field.name === fieldName) ||
           statusFieldsConfig.verificationFields.find(field => field.name === fieldName);
  }
};