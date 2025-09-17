import AdminLoginForm from "@/components/auth/AdminLoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knock Off Dues - Login",
  keywords: "Knock Off Dues, Admin Login, Admin Dashboard",
  description: "Knock Off Dues admin panel login page for managing the platform.",
};

export default function AdminLogin() {
  return <AdminLoginForm />;
} 