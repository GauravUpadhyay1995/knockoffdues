"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import NotificationDropdown from "@/components/notification/AllNotification";
 const FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "notification_local" : "notifications";
export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isBadgeVisible, setIsBadgeVisible] = useState(true);
    const { admin } = useAuth();
    const userId = admin?.id || "";
    const className = "";
    const blinkInterval = 900;
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleBellClick = () => {
        setIsDropdownOpen(!isDropdownOpen);

    };
    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, FIREBASE_DATABASE_NAME),
            where("userId", "==", userId),
            where("isSeen", "==", false)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newCount = snapshot.size;
                setUnreadCount(newCount);
            },
            (error) => {
                console.error("Error fetching notifications:", error);
            }
        );

        return () => unsubscribe();
    }, [userId]);

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
    // const fetchAllNotifications = () => {
    //     router.push(`/admin/notifications`);
    // }

    return (
        <>

            <div
                className={`cursor-pointer relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
                onClick={handleBellClick}
            >
                <NotificationDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />

                <div
                    className={`relative p-2 rounded-full transition-all`}
                >

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
                            className={`p-1 absolute -top-1 -right-4 min-w-[30px] h-[30px] flex items-center justify-center  rounded-full text-xs font-semibold text-white bg-orange-500 border-2 border-white transition-all duration-300 ${isBadgeVisible ? "opacity-100 scale-100" : "opacity-0 scale-10"}`}
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>
            </div>

        </>
    );


}