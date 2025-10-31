import ResetPassword from "@/components/auth/ResetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knock Off Dues - Reset Password",
  keywords: "Knock Off Dues, Admin Login, Admin Dashboard",
  description: "Knock Off Dues admin panel Reset Password page for managing the platform.",
};

export default function ResetPasswords() {
  return <ResetPassword />;
} 