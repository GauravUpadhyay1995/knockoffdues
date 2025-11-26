"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

interface Notification {
    id: string;
    notificationId: string;
    title: string;
    description: string;
    type: string;
    isSeen: boolean;
    timestamp: any;
    data?: any;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { admin } = useAuth();
    const userId = admin?.id || "";
    const router = useRouter();
 const FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "notification_local" : "notifications";



    useEffect(() => {
        // Only fetch if dropdown is open AND we have a userId
        if (!isOpen || !userId) {
            // If closing or no userId, clear notifications
            if (!isOpen) {
                setNotifications([]);
                setIsLoading(true);
            }
            return;
        }

        const q = query(
            collection(db, FIREBASE_DATABASE_NAME),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[];

                setNotifications(notifs);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching notifications:", error);
                setIsLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [isOpen, userId]);

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`,
                {
                    method: "PATCH",
                }
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(notif => !notif.isSeen);

            // 2️⃣ Call your API for each unread notification
            await Promise.all(
                unreadNotifications.map(async (notif, idx) => {

                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all/${userId}`,
                        {
                            method: "PATCH",
                        }
                    );

                    if (!response.ok) {
                        console.error(`Failed to update notification ${notif.id}`);
                    }
                })
            );

        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };


    const getNotificationIcon = (type: string) => {
        const icons = {
            Task: "📋",
            Message: "💬",
            Alert: "⚠️",
            Success: "✅",
            Warning: "⚠️",
            Info: "ℹ️",
            Error: "❌",
            Other: "🔔",
            Meeting: "📅",
            Update: "🔄",
            Promotion: "🎉",
            Birthday: "🎂",
            Reminder: "⏰",
            Social: "👥",
            System: "💻",
            User: "👤",
            Followup:"👤",

        };

        return icons[type as keyof typeof icons] || icons.Other;
    };

    const getNotificationColor = (type: string) => {
        const colors = {
            Task: "bg-blue-100 border-blue-200",
            Message: "bg-purple-100 border-purple-200",
            Alert: "bg-yellow-100 border-yellow-200",
            Success: "bg-green-100 border-green-200",
            Warning: "bg-orange-100 border-orange-200",
            Info: "bg-cyan-100 border-cyan-200",
            Error: "bg-red-100 border-red-200",
            Other: " dark:bg-gray-100 bg-gray-300 border-gray-200"
        };

        return colors[type as keyof typeof colors] || colors.Other;
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (minutes < 1) return "Just now";
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;

            return date.toLocaleDateString();
        } catch (error) {
            return "Recently";
        }
    };

    const viewAllNotification = () => {
        router.push(`/admin/notifications`);
    }

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - removed onClick handler */}
            <div className="fixed inset-0 bg-black/5 backdrop-blur-xs " />

            {/* Dropdown */}
            <div
                ref={dropdownRef}
                onClick={(e) => {
                    // stop only if the click is NOT on the "View all" button
                    if (!(e.target as HTMLElement).closest('#viewAllBtn')) {
                        e.stopPropagation();
                    }
                }} // 🛑 Prevent closing when clicking inside
                className="fixed top-16 right-4 w-96 max-w-sm dark:bg-gray-800 bg-white rounded-xl shadow-2xl border border-gray-200 animate-slideIn"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:bg-gray-800 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            {notifications.some(notif => !notif.isSeen) && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 dark:hover:text-gray-100 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors dark:text-gray-100 dark:hover:bg-gray-500"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-100">
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">🎉</div>
                            <p className="text-gray-600">No notifications yet</p>
                            <p className="text-sm text-gray-500 mt-1">We'll notify you when something arrives</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 dark:bg-gray-800 transition-all duration-300 hover:bg-gray-50 ${index === 0 ? 'animate-bounceIn' : ''} ${!notification.isSeen ? 'bg-blue-50' : ''}`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100" dangerouslySetInnerHTML={{ __html: notification.title }}>

                                                </h4>
                                                {!notification.isSeen && (
                                                    <span className="dark:text-gray-100 flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: notification?.description }}>

                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-300">
                                                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <span>{formatTimestamp(notification.timestamp)}</span>
                                                </div>

                                                {!notification.isSeen && (
                                                    <button
                                                        onClick={() => markAsRead(notification.notificationId)}
                                                        className="text-xs text-blue-600 dark:hover:bg-gray-500 dark:hover:text-gray-100 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors dark:text-gray-100"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl dark:bg-gray-800">
                    <button id="viewAllBtn" onClick={viewAllNotification} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 rounded-md hover:bg-blue-100 transition-colors dark:text-gray-100 dark:hover:bg-gray-500">
                        View all notifications
                    </button>
                </div>
            </div>

            {/* Animation Styles */}
            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-bounceIn {
                    animation: bounceIn 0.6s ease-out;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
}