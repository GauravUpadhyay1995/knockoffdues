"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from '@/context/AuthContext';

export default function AdminLoginForm() {
          const { settings, isLoadingSettings } = useSettings();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("mobile", mobile);
      if (resume) formData.append("resume", resume);

      const response = await fetch(`/api/v1/admin/signup`, {
        method: "POST",
        // ❌ Do NOT set Content-Type when using FormData
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Registration successful!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const msg = data.message || "Registration failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-center  dark:bg-gray-900 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row w-full max-w-4xl bg-gradient-to-br from-orange-50/70 via-cyan-50/70 to-blue-50/70 dark:from-gray-900 dark:via-gray-950 dark:to-black border-t border-orange-200/50 dark:border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
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
            <form onSubmit={handleSubmit}>
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
                  />
                </div>

                <div className="flex-1">
                  <Label>
                    Resume <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="file"
                    className="mt-1"
                    onChange={(e) =>
                      setResume(e.target.files ? e.target.files[0] : null)
                    }
                  />
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
                />
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
                  />
                </div>

                <div className="flex-1">
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  disabled={
                    loading || !name || !email || !mobile || !password || !resume
                  }
                  className="w-full gradient-bg hover:bg-purple-700 text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                  variant="primary"
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex w-1/2 p-6 sm:p-10 bg-gradient-to-br from-cyan-500 to-orange-500 dark:from-cyan-500 dark:to-purple-900 text-white flex-col items-center justify-center text-center">
          <div className="mb-6 flex justify-center">
            <Link href="/" aria-label="Go to Home page">
               <Image className="h-24 w-24 rounded-full object-cover mt-4"    src={settings?.companyLogo || "/images/logo/logo.png"} alt="Knock Off Dues Logo" width={100} height={50} priority />
            </Link>
          </div>
          <h2 className="font-bold text-3xl sm:text-4xl mb-4 leading-tight">
            Signup Yourself
          </h2>
          <p className="text-purple-100 text-lg mb-8 opacity-90">
            Welcome to the Registration Panel. Please enter details to access the features.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
