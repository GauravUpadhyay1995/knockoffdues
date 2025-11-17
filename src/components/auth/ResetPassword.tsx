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
export default function ResetPasswordForm() {
      const { settings, isLoadingSettings } = useSettings();
    
    const { theme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    action: "send_otp"
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('OTP sent to your email!');
                setStep("otp");
            } else {
                setError(data.message || 'Failed to send OTP. Please try again.');
                toast.error(data.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
            setError(message);
            console.error('Send OTP error:', error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp,
                    action: "verify_otp"
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('OTP verified successfully!');
                setStep("newPassword");
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
                toast.error(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.';
            setError(message);
            console.error('Verify OTP error:', error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match!");
            toast.error("Passwords don't match!");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long!");
            toast.error("Password must be at least 6 characters long!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword,
                    action: "reset_password"
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Password reset successfully!');
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');
                toast.error(data.message || 'Failed to reset password. Please try again.');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
            setError(message);
            console.error('Reset password error:', error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email,  action: "send_otp" }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('New OTP sent to your email!');
            } else {
                toast.error(data.message || 'Failed to resend OTP.');
            }
        } catch (error: unknown) {
            toast.error('Failed to resend OTP. Please try again.');
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
                    {/* Left Panel: Reset Password Form */}
                    <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6"
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:gradient-text"
                            >
                                <ChevronLeftIcon />
                                Back to login
                            </Link>
                        </motion.div>

                        <motion.h1
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="mb-1.5 font-semibold text-gray-800 text-3xl sm:text-4xl lg:text-5xl dark:text-white/90"
                        >
                            {success ? "Password Reset!" :
                                step === "email" ? "Reset Password" :
                                    step === "otp" ? "Enter OTP" : "New Password"}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8"
                        >
                            {success ? "Your password has been reset successfully. Redirecting to login..." :
                                step === "email" ? "Enter your email to receive a verification code" :
                                    step === "otp" ? "Enter the 6-digit code sent to your email" :
                                        "Enter your new password"}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-green-600 dark:text-green-400 text-lg font-medium">
                                            Password reset successful!
                                        </p>
                                    </motion.div>
                                ) : step === "email" ? (
                                    <motion.form
                                        key="email-form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleSendOTP}
                                    >
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
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="mt-2"
                                                        required
                                                    />
                                                </motion.div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="mt-6"
                                            >
                                                <Button
                                                    disabled={loading || !email}
                                                    className="w-full gradient-bg hover:bg-purple-700 text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                                                    variant="primary"
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Sending OTP...
                                                        </div>
                                                    ) : (
                                                        'Send Verification Code'
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </motion.form>
                                ) : step === "otp" ? (
                                    <motion.form
                                        key="otp-form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleVerifyOTP}
                                    >
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
                                                    Verification Code <span className="text-red-500"> &nbsp; *</span>
                                                </Label>
                                                <motion.div whileFocus={{ scale: 1.01 }}>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter 6-digit OTP"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className="mt-2 text-center text-lg font-mono"
                                                        required
                                                    />
                                                </motion.div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleResendOTP}
                                                        disabled={loading}
                                                        className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50"
                                                    >
                                                        Resend OTP
                                                    </button>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {otp.length}/6
                                                    </span>
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="mt-6"
                                            >
                                                <Button
                                                    disabled={loading || otp.length !== 6}
                                                    className="w-full gradient-bg hover:bg-purple-700 text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                                                    variant="primary"
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Verifying...
                                                        </div>
                                                    ) : (
                                                        'Verify Code'
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="password-form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleResetPassword}
                                    >
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
                                                    New Password <span className="text-red-500"> &nbsp; *</span>
                                                </Label>
                                                <motion.div whileFocus={{ scale: 1.01 }}>
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter new password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="mt-2"
                                                        required
                                                        minLength={6}
                                                    />
                                                </motion.div>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8, duration: 0.8 }}
                                            >
                                                <Label>
                                                    Confirm Password <span className="text-red-500"> &nbsp;*</span>
                                                </Label>
                                                <motion.div whileFocus={{ scale: 1.01 }}>
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="mt-2"
                                                        required
                                                        minLength={6}
                                                    />
                                                </motion.div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="mt-6"
                                            >
                                                <Button
                                                    disabled={loading || !newPassword || !confirmPassword}
                                                    className="w-full gradient-bg hover:bg-purple-700 text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                                                    variant="primary"
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Resetting...
                                                        </div>
                                                    ) : (
                                                        'Reset Password'
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Right Panel: Illustration Section */}
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
                                    <Image className="h-24 w-24 rounded-full object-cover mt-4"    src={settings?.companyLogo || "/images/logo/logo.png"} alt="Knock Off Dues Logo" width={100} height={50} priority />
                                </Link>
                            </div>
                            <h2 className="font-bold text-3xl sm:text-4xl mb-4 leading-tight">
                                {step === "email" ? "Forgot Password?" :
                                    step === "otp" ? "Check Your Email" :
                                        "Almost Done!"}
                            </h2>
                            <p className="text-purple-100 text-lg mb-8 opacity-90">
                                {step === "email" ? "We'll send a verification code to your email to reset your password." :
                                    step === "otp" ? "Enter the 6-digit code we sent to your email address." :
                                        "Create a new secure password for your account."}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}