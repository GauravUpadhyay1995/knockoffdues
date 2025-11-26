"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from '@/context/ThemeContext';
import { useSettings } from '@/context/AuthContext';

export default function AdminLoginForm() {
  const { settings, isLoadingSettings } = useSettings();
  const [showPassword, setShowPassword] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("gaurav@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
        credentials: 'include'
      });

      const responce = await response.json();

      if (responce.success) {
        login(responce.token);
        localStorage.setItem('adminToken', responce.token || '');
        toast.success('Login successful!');
        router.push('/admin');
      } else {
        setError(responce.message || 'Invalid credentials. Please try again.');
        toast.error(responce.message || 'Invalid credentials. Please try again.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(message);
      console.error('Login error:', error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-4 flex items-center justify-center dark:bg-gray-900 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row w-full max-w-4xl bg-gradient-to-br from-orange-50/70 via-cyan-50/70 to-blue-50/70 dark:from-gray-900 dark:via-gray-950 dark:to-black
                  border-t border-orange-200/50 dark:border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Left Panel: Admin Login Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:gradient-text"
              >
                <ChevronLeftIcon />
                Back to home
              </Link>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mb-1.5 font-semibold text-gray-800 text-3xl sm:text-4xl lg:text-5xl dark:text-white/90"
            >
              Login Panel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8"
            >
              Enter your credentials to access the dashboard
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="space-y-5 sm:space-y-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <Label>
                      Email <span className="text-red-500"> &nbsp; *</span>
                    </Label>
                    <motion.div whileFocus={{ scale: 1.01 }}>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                      />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <Label>
                      Password <span className="text-red-500"> &nbsp;*</span>
                    </Label>

                    <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 pr-12" // Added padding for the button
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-3 rounded-md transition-colors"
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
                    </motion.div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6"
                  >
                    <Button
                      disabled={loading || (email === '' || password === '')}
                      className="w-full gradient-bg hover:bg-purple-700 text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                      variant="primary"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Logging in...
                        </div>
                      ) : (
                        'Login'
                      )}
                    </Button>
                    <div className="flex justify-end mt-2">
                      <Link
                        href="/reset"
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:gradient-text"
                      >
                        Reset Password ?
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Panel: Admin Welcome/Illustration Section */}
          <div className="hidden lg:flex w-1/2 p-6 sm:p-10 bg-gradient-to-br from-cyan-500 to-orange-500 dark:from-cyan-500 dark:to-purple-900 text-white flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="mb-6 flex justify-center">
                <Link
                  href="/"
                  className="block p-2 rounded-lg transition-all duration-300 transform"
                  aria-label="Go to Home page"
                >
                  <Image className="h-24 w-24 rounded-full object-cover mt-4" src={settings?.companyLogo || "/images/logo/logo.png"} alt="Knock Off Dues Logo" width={100} height={50} priority />
                </Link>
              </div>
              <h2 className="font-bold text-3xl sm:text-4xl mb-4 leading-tight">
                Dashboard Access
              </h2>
              <p className="text-purple-100 text-lg mb-8 opacity-90">
                Welcome to the dashboard. Please login to access the features.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}