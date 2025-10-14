"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Sparkles, User } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import the auth hook
import QRGenerator from "@/components/common/RegistreationQrCode";
import QRModal from "@/components/common/QrModal";
const RightSideDrawer = () => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticatedAdmin } = useAuth(); // Get authentication state
  const [mounted, setMounted] = useState(false);
  const [isRegisterQrOpen, setIsRegisterQrOpen] = useState(false);

  const [isLoginQrOpen, setIsLoginQrOpen] = useState(false);


  // 🔑 Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);


  useEffect(() => {
    setMounted(true);

    // Open QR modal automatically on first mount
    // setIsRegisterQrOpen(true);
  }, []);



  // ✅ Stable particle positions (no hydration mismatch)
  const particles = useMemo(() => {
    return Array.from({ length: 3 }, () => ({
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
    }));
  }, []);

  // Don't render anything if user is authenticated
  if (isAuthenticatedAdmin) {
    return null;
  }
  if (!mounted) return null;
  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-l-xl shadow-lg z-[10] flex flex-col items-center justify-center gap-1"
        initial={{ x: 0 }}
        animate={{ x: isHovered ? -5 : 0 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isHovered ? 10 : 0 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <User className="w-5 h-5" />
        </motion.div>
        <motion.span
          className="text-xs font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        >
          Account
        </motion.span>

        {/* Floating particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: p.x,
                    y: p.y
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Drawer + Backdrop */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200
              }}
              className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 shadow-2xl z-500 flex flex-col border-l border-gray-200"
            >
              {/* Top border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />

              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-gray-200 relative">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    User Panel
                  </h2>
                </motion.div>

                <motion.button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 z-[70] transition-colors"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {/* Login */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    href='/login'
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md hover:-translate-y-0.5 border border-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="p-2 bg-purple-100 rounded-lg"
                    >
                      <LogIn className="w-5 h-5 text-purple-600" />
                    </motion.div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Login</span>
                      <span className="text-xs text-gray-500">Access your account</span>
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link

                    href='#'
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md hover:-translate-y-0.5 border border-gray-100"
                    onClick={() => {
                      setIsLoginQrOpen(true)
                      setOpen(false)
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="p-2 bg-purple-100 rounded-lg"
                    >
                      <LogIn className="w-5 h-5 text-purple-600" />

                    </motion.div>
                    <div className="flex flex-col">
                      <span className="font-semibold  text-orange-500 ">Login with QR</span>
                      <span className="text-xs text-gray-500">Access your account</span>
                    </div>
                  </Link>
                </motion.div>

                {/* Register */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href='/signup'
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md hover:-translate-y-0.5 border border-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="p-2 bg-indigo-100 rounded-lg"
                    >
                      <UserPlus className="w-5 h-5 text-indigo-600" />
                    </motion.div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Register</span>
                      <span className="text-xs text-gray-500">Create new account</span>
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link

                    href='#'
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md hover:-translate-y-0.5 border border-gray-100"
                    onClick={() => {
                      setIsRegisterQrOpen(true)
                      setOpen(false)
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="p-2 bg-purple-100 rounded-lg"
                    >
                      <UserPlus className="w-5 h-5 text-indigo-600" />

                    </motion.div>
                    <div className="flex flex-col">
                      <span className="font-semibold  text-orange-500 ">Register with QR</span>
                      <span className="text-xs text-gray-500">Create New account</span>
                    </div>
                  </Link>
                </motion.div>

                {/* More options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 mt-4 border-t border-gray-100"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">More options</h3>
                  <div className="space-y-2">
                    {['Profile', 'Settings', 'Help'].map((item, index) => (
                      <motion.div
                        key={item}
                        whileHover={{ x: 5 }}
                        className="px-3 py-2 text-sm text-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 border-t border-gray-200 text-center"
              >
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Secure user portal
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <QRModal isOpen={isRegisterQrOpen} onClose={() => setIsRegisterQrOpen(false)}>
        <h1 className="text-xl font-bold mb-4 text-center dark:text-gray-300">Scan QR to Register</h1>
        <QRGenerator type="Register" />
      </QRModal>
      <QRModal isOpen={isLoginQrOpen} onClose={() => setIsLoginQrOpen(false)}>
        <h1 className="text-xl font-bold mb-4 text-center  dark:text-gray-300">Scan QR to Login</h1>
        <QRGenerator type="Login" />
      </QRModal>

    </>
  );
};

export default RightSideDrawer;