"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import NotificationBell from "@/components/common/FireBaseNotification";
import React, { useState, useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const { theme } = useTheme();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-9 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex items-center justify-between w-full px-3 py-3 lg:px-6 lg:py-4">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sidebar toggle */}
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 0 1 1.06-1.06L12 10.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L10.94 12 6.22 7.28Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M.583 1c0-.414.336-.75.75-.75h13.334c.414 0 .75.336.75.75s-.336.75-.75.75H1.333a.75.75 0 0 1-.75-.75Zm0 10c0-.414.336-.75.75-.75h13.334c.414 0 .75.336.75.75s-.336.75-.75.75H1.333a.75.75 0 0 1-.75-.75ZM1.333 5.25c-.414 0-.75.336-.75.75s.336.75.75.75H8a.75.75 0 0 0 0-1.5H1.333Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo (mobile only) */}
          <Link href="/admin" className="flex items-center lg:hidden">
            <Image
              className="h-10 w-10 rounded-full object-cover"
              src="/images/logo/logo.png"
              alt="Knock Off Dues Logo"
              width={40}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* RIGHT SECTION (always visible) */}
        <div className="flex items-center gap-3 ml-auto">
          
          <NotificationBell />
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
