"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ReminderDropdown from "@/components/notification/AllReminder";
import dayjs from "dayjs";

const billingReminderRef = collection(db, "BillingReminder");

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isBadgeVisible, setIsBadgeVisible] = useState(true);
    const { admin } = useAuth();
    const userId = admin?.id || "";
    const className = "";
    const blinkInterval = 900;
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(Timestamp.now());

    const handleBellClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Update current time every minute to catch new reminders
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Timestamp.now());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!userId) {
            console.log("No user ID available");
            return;
        }

        console.log("🕒 Setting up listener with time:", currentTime.toDate());
        
        const q = query(
            billingReminderRef,
            where("reminderTime", "<=", currentTime),
            where("isSeen", "==", false),
            // where("userId", "==", userId) // Add this if you have user-specific reminders
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("📊 Snapshot received, documents:", snapshot.size);
            
            let unreadCount = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log("📋 Reminder found:", {
                    id: doc.id,
                    title: data.title,
                    reminderTime: data.reminderTime?.toDate?.(),
                    isSeen: data.isSeen
                });

                if (data.isSeen === false) {
                    unreadCount++;
                }
            });

            console.log("🔢 Final unread count:", unreadCount);
            setUnreadCount(unreadCount);
        }, (error) => {
            console.error("❌ Firebase error:", error);
        });

        return () => {
            console.log("🧹 Cleaning up listener");
            unsubscribe();
        };
    }, [userId, currentTime]); // Add currentTime as dependency

    useEffect(() => {
        if (unreadCount > 0) {
            const interval = setInterval(() => {
                setIsBadgeVisible((prev) => !prev);
            }, blinkInterval);
            return () => clearInterval(interval);
        } else {
            setIsBadgeVisible(true);
        }
    }, [unreadCount, blinkInterval]);

    return (
        <>
            <div
                className={`cursor-pointer relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
                onClick={handleBellClick}
            >
                <ReminderDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
                
                {/* Bell Icon */}
                <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span
                        className={`p-1 absolute -top-1 -right-1 min-w-[24px] h-[24px] flex items-center justify-center rounded-full text-xs font-semibold text-white bg-orange-500 border-2 border-white transition-all duration-300 ${isBadgeVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </div>
        </>
    );
}