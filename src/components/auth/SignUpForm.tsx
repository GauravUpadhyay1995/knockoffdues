"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from '@/context/AuthContext';

export default function AdminLoginForm() {
  const { settings, isLoadingSettings } = useSettings();
  const resumeRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    resume?: string;
  }>({});

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobile) return "Mobile number is required";
    if (!mobileRegex.test(mobile)) return "Please enter a valid 10-digit mobile number";
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";
    return null;
  };

  const validateName = (name: string) => {
    if (!name) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters long";
    return null;
  };

  const validateResume = (file: File | null) => {
    if (!file) return "Resume is required";

    // Check file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return "Only PDF files are allowed for resume";
    }

    // Check file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      return "Resume file size must be less than 1MB";
    }

    return null;
  };

  // Real-time validation
  useEffect(() => {
    const errors: typeof fieldErrors = {};

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const mobileError = validateMobile(mobile);
    const passwordError = validatePassword(password);
    const resumeError = validateResume(resume);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (mobileError) errors.mobile = mobileError;
    if (passwordError) errors.password = passwordError;
    if (resumeError) errors.resume = resumeError;

    setFieldErrors(errors);
  }, [name, email, mobile, password, resume]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setResume(null);
    setError(null);
    setFieldErrors({});

    if (resumeRef.current) {
      resumeRef.current.value = "";
    }

    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      const resumeError = validateResume(file);
      if (resumeError) {
        setFieldErrors(prev => ({ ...prev, resume: resumeError }));
        setResume(null);
        if (resumeRef.current) {
          resumeRef.current.value = "";
        }
        toast.error(resumeError);
        return;
      }
    }

    setResume(file);
  };

  const isFormValid = () => {
    return (
      name &&
      email &&
      mobile &&
      password &&
      resume &&
      Object.keys(fieldErrors).length === 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerificationMessage(false);

    // Final validation before submit
    const finalErrors: typeof fieldErrors = {};

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const mobileError = validateMobile(mobile);
    const passwordError = validatePassword(password);
    const resumeError = validateResume(resume);

    if (nameError) finalErrors.name = nameError;
    if (emailError) finalErrors.email = emailError;
    if (mobileError) finalErrors.mobile = mobileError;
    if (passwordError) finalErrors.password = passwordError;
    if (resumeError) finalErrors.resume = resumeError;

    if (Object.keys(finalErrors).length > 0) {
      setFieldErrors(finalErrors);
      setLoading(false);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("mobile", mobile);
      if (resume) formData.append("resume", resume);

      const response = await fetch(`/api/v1/admin/signup`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationMessage(true);
        toast.success("Registration successful!");
        resetForm();
      } else {
        const msg = data.message || "Registration failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-center dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row w-full max-w-6xl bg-gradient-to-br from-orange-50/70 via-cyan-50/70 to-blue-50/70 dark:from-gray-900 dark:via-gray-950 dark:to-black border-t border-orange-200/50 dark:border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          {verificationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-4 rounded-xl mb-2"
            >
              Registration successful! Please check your email to verify your account.
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-1"
          >
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:gradient-text"
            >
              <ChevronLeftIcon /> Back to home
            </Link>
          </motion.div>

          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-1 font-semibold text-gray-800 text-xl sm:text-2xl lg:text-xl dark:text-white/90"
          >
            Register Yourself
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base text-gray-500 dark:text-gray-400 mb-1 sm:mb-1"
          >
            Enter all details to register yourself
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <form ref={formRef} onSubmit={handleSubmit}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-2"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="flex-1">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    required
                  />
                  {fieldErrors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {fieldErrors.name}
                    </motion.p>
                  )}
                </div>

                <div className="flex-1">
                  <Label>
                    Resume <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    ref={resumeRef}
                    type="file"
                    className="mt-1"
                    onChange={handleResumeChange}
                    accept=".pdf"
                    required
                  />
                  {fieldErrors.resume && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {fieldErrors.resume}
                    </motion.p>
                  )}
                  {resume && !fieldErrors.resume && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-green-500 text-xs mt-1"
                    >
                      ✓ Resume selected: {resume.name} ({(resume.size / 1024 / 1024).toFixed(2)} MB)
                    </motion.p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Only PDF files are allowed. Maximum file size: 1MB
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Label>
                    Mobile <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="mt-1"
                    required
                  />
                  {fieldErrors.mobile && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {fieldErrors.mobile}
                    </motion.p>
                  )}
                </div>

                <div className="flex-1 relative">
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 pr-10" // Added right padding for the button
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-1 rounded-md transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.5 12c1.234 4.873 5.593 8.25 10.5 8.25 1.99 0 3.86-.54 5.46-1.477M21 12c-.333-1.318-.97-2.55-1.86-3.61M9.53 9.53a3.75 3.75 0 015.304 5.304M6.53 6.53L3 3m3.53 3.53L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12c1.344-4.493 5.415-7.5 9.964-7.5 4.55 0 8.62 3.007 9.964 7.5-1.344 4.493-5.415 7.5-9.964 7.5-4.55 0-8.62-3.007-9.964-7.5z"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {fieldErrors.password}
                    </motion.p>
                  )}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  disabled={loading || !isFormValid()}
                  className="w-full gradient-bg hover:bg-purple-700 text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  variant="primary"
                  type="submit"
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </motion.div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/admin/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex w-1/2 p-6 sm:p-10 bg-gradient-to-br from-cyan-500 to-orange-500 dark:from-cyan-500 dark:to-purple-900 text-white flex-col items-center justify-center text-center">
          <div className="mb-6 flex justify-center">
            <Link href="/" aria-label="Go to Home page">
              <Image
                className="h-24 w-24 rounded-full object-cover mt-4"
                src={settings?.companyLogo || "/images/logo/logo.png"}
                alt="Knock Off Dues Logo"
                width={100}
                height={50}
                priority
              />
            </Link>
          </div>
          <h2 className="font-bold text-3xl sm:text-4xl mb-4 leading-tight">
            Join Our Team
          </h2>
          <p className="text-purple-100 text-lg mb-8 opacity-90">
            Create your account to access the admin dashboard and manage your organization efficiently.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md">
            <h3 className="font-semibold text-xl mb-3">Why Register?</h3>
            <ul className="text-left space-y-2 text-purple-100">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Access powerful admin tools
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Manage users and permissions
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Track analytics and reports
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Secure and reliable platform
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}