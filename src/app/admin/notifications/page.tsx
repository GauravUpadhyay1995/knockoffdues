"use client";
import React, { useState, useEffect } from "react";
import {
    ClipboardList,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Info,
    XCircle,
    Bell,
    CalendarDays,
    RefreshCw,
    Gift,
    Cake,
    Clock,
    Users,
    Monitor,

} from "lucide-react";
import {

    FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from "@/context/AuthContext";

const X = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

interface Notification {
    id: string; // notificationStatusId from backend
    message: string;
    type: string;
    read: boolean;
    timestamp: string;
    descriptions?:string;
}

const App = () => {
    const { admin } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Mark single notification read
    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/v1/admin/notifications/${id}/read`, {
                method: "PATCH",
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    // 🔹 Mark all notifications read
    const markAllAsRead = async () => {
        if (!admin?.id) return;
        try {
            const res = await fetch(`/api/v1/admin/notifications/read-all/${admin.id}`, {
                method: "PATCH",
            });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    // 🔹 Delete locally (optional, since no delete API provided)
    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type: string) => {
        const icons: Record<string, JSX.Element> = {
            Task: <ClipboardList className="h-5 w-5 text-orange-500 dark:text-blue-500" />,
            Message: <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-500" />,
            Alert: <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-yellow-500" />,
            Success: <CheckCircle className="h-5 w-5 text-orange-500 dark:text-green-600" />,
            Warning: <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-500" />,
            Info: <Info className="h-5 w-5 text-orange-500 dark:text-blue-400" />,
            Error: <XCircle className="h-5 w-5 text-orange-500 dark:text-red-500" />,
            Other: <Bell className="h-5 w-5 text-orange-500 dark:text-gray-400" />,
            Meeting: <CalendarDays className="h-5 w-5 text-orange-500 dark:text-indigo-500" />,
            Update: <RefreshCw className="h-5 w-5 text-orange-500 dark:text-purple-500" />,
            Promotion: <Gift className="h-5 w-5 text-orange-500 dark:text-pink-500" />,
            Birthday: <Cake className="h-5 w-5 text-orange-500 dark:text-pink-400" />,
            Reminder: <Clock className="h-5 w-5 text-orange-500 dark:text-teal-500" />,
            Social: <Users className="h-5 w-5 text-orange-500 dark:text-violet-500" />,
            System: <Monitor className="h-5 w-5 text-orange-500 dark:text-gray-600" />,
        };
        return icons[type as keyof typeof icons] || icons.Other;
    };

    const fetchNotifications = async () => {
        try {
            if (!admin?.id) return;

            const res = await fetch(
                `/api/v1/admin/notifications/users/${admin.id}`
            );
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                console.log(data.data)
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, [admin?.id]);
    if (loading) {
        return (
            <div className="min-h-screen font-sans text-white p-6 md:p-12 antialiased">
                <div className="max-w-6xl mx-auto space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center p-5 rounded-2xl shadow-xl bg-slate-800 animate-pulse space-x-4"
                        >
                            {/* Icon placeholder */}
                            <div className="h-10 w-10 rounded-full bg-slate-700" />

                            {/* Text placeholders */}
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-slate-700 rounded w-3/4" />
                                <div className="h-3 bg-slate-700 rounded w-1/2" />
                            </div>

                            {/* Action button placeholder */}
                            <div className="h-8 w-20 bg-slate-700 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen font-sans text-white p-6 md:p-12 antialiased">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold dark:text-gray-300 text-gray-500">
                        Notifications
                    </h1>

                    <div className="flex gap-3">
                        <button onClick={fetchNotifications} className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <FiRefreshCw className="mr-2" /> Refresh</button>
                        <button
                            onClick={markAllAsRead}
                            className={`px-4 py-2 text-sm font-semibold rounded-full dark:bg-slate-800 bg-orange-600 dark:text-indigo-400 text-orange-100 hover:bg-orange-700 dark:hover:bg-slate-700 transition-colors duration-200 shadow-md hover:shadow-lg ${notifications.length === 0 ? "cursor-not-allowed" : ""
                                }`}
                            disabled={notifications.length === 0}
                        >
                            Mark all as read
                        </button>



                    </div>
                </div>


                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-slate-800 p-8 rounded-2xl text-center text-slate-400 shadow-lg border border-slate-700">
                            <p className="text-lg">
                                You're all caught up! No new notifications.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id}
                                className={`relative flex items-center p-5 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02]  ${notification.read
                                    ? "dark:bg-slate-800 dark:text-slate-400 bg-orange-200 text-orange-500"
                                    : "dark:bg-zinc-800 dark:text-slate-100 ring-2 ring-orange-500 bg-orange-300 text-orange-700"
                                    }`}
                            >
                                {!notification.read && (
                                    <div className="absolute top-3 left-3 h-2.5 w-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                                )}
                                <div className="flex-shrink-0 mr-4 pl-4">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-grow">
                                    <p
                                        className={`font-semibold `}
                                    >
                                        {notification.message}
                                    </p>
                                     <p
                                        className={`font-semibold `}
                                    >
                                        {notification?.descriptions}
                                    </p>
                                    <p className="text-sm mt-1 opacity-75">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400 transition-colors duration-200 rounded-full dark:hover:bg-slate-700 hover:bg-orange-500"
                                    aria-label="Delete notification"
                                >
                                    <X className="h-5 w-5 text-orange-900 dark:text-orange-500" />
                                </button>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="flex-shrink-0 ml-4 px-4 py-2 text-xs font-bold rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-200 shadow-md"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
