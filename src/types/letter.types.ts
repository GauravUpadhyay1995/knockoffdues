// types/letter.types.ts
export interface CompanyData {
  companyName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export interface EmployeeData {
  name: string;
  address: string;
  position: string;
  department: string;
  employeeId?: string;
  joiningDate?: string;
  salary?: string;
}

export interface LetterBaseProps {
  company: CompanyData;
  employee: EmployeeData;
  date: string;
}