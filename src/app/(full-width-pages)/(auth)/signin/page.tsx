import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knock Off Dues - Sign In",
  keywords: "Knock Off Dues, Sign In, Dashboard",
  description: "Knock Off Dues, Sign In, Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
