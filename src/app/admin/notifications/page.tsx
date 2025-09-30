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
    X,
    BellOff,
    Search,
    Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    timestamp: string;
    descriptions?: string;
}

const App = () => {
    const { admin } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"All" | "Unread" | "Read">("All");
    const [filterType, setFilterType] = useState("All");

    const unreadCount = notifications.filter((n) => !n.read).length;
    const uniqueTypes = ["All", ...new Set(notifications.map((n) => n.type))];

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/v1/admin/notifications/${id}/read`, { method: "PATCH" });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

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

    const deleteNotification = (id: string) =>
        setNotifications((prev) => prev.filter((n) => n.id !== id));

    const clearAllNotifications = () => {
        setNotifications([]);
        fetchNotifications();
        setSearchTerm("");
        setFilterStatus("All");
        setFilterType("All");
        setLoading(true);
    };

    const getIcon = (type: string) => {
        const icons: Record<string, JSX.Element> = {
            Task: <ClipboardList className="h-6 w-6 text-indigo-400" />,
            Message: <MessageSquare className="h-6 w-6 text-blue-400" />,
            Alert: <AlertTriangle className="h-6 w-6 text-yellow-400" />,
            Success: <CheckCircle className="h-6 w-6 text-green-400" />,
            Warning: <AlertTriangle className="h-6 w-6 text-orange-400" />,
            Info: <Info className="h-6 w-6 text-cyan-400" />,
            Error: <XCircle className="h-6 w-6 text-red-400" />,
            Other: <Bell className="h-6 w-6 text-gray-400" />,
            Meeting: <CalendarDays className="h-6 w-6 text-purple-400" />,
            Update: <RefreshCw className="h-6 w-6 text-teal-400" />,
            Promotion: <Gift className="h-6 w-6 text-pink-400" />,
            Birthday: <Cake className="h-6 w-6 text-rose-400" />,
            Reminder: <Clock className="h-6 w-6 text-lime-400" />,
            Social: <Users className="h-6 w-6 text-violet-400" />,
            System: <Monitor className="h-6 w-6 text-slate-400" />,
        };
        return icons[type as keyof typeof icons] || icons.Other;
    };

    const formatRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const sec = Math.floor(diff / 1000);
        const min = Math.floor(sec / 60);
        const hr = Math.floor(min / 60);
        const day = Math.floor(hr / 24);
        if (sec < 60) return "Just now";
        if (min < 60) return `${min} min ago`;
        if (hr < 24) return `${hr} hours ago`;
        if (day < 7) return `${day} days ago`;
        return date.toLocaleDateString();
    };

    const getGroup = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0) return "Recent";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return "This Week";
        return "Older";
    };

    const fetchNotifications = async () => {
        try {
            if (!admin?.id) return;
            const res = await fetch(`/api/v1/admin/notifications/users/${admin.id}`);
            const data = await res.json();
            if (data.success) {
                const sorted = data.data.sort(
                    (a: Notification, b: Notification) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setNotifications(sorted);
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

    const filtered = notifications.filter((n) => {
        const matchesSearch =
            n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.descriptions &&
                n.descriptions.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus =
            filterStatus === "All" ||
            (filterStatus === "Unread" && !n.read) ||
            (filterStatus === "Read" && n.read);
        const matchesType = filterType === "All" || n.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const grouped = filtered.reduce((acc, n) => {
        const g = getGroup(n.timestamp);
        if (!acc[g]) acc[g] = [];
        acc[g].push(n);
        return acc;
    }, {} as Record<string, Notification[]>);

    const groupOrder = ["Recent", "Yesterday", "This Week", "Older"];

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-opacity-20 backdrop-blur-md rounded-xl p-4 sm:p-6 animate-pulse flex items-start space-x-4 shadow-lg border dark:bg-indigo-900/20 border-indigo-500/20 bg-gray-200/20"
                        >
                            <div className="h-10 w-10 rounded-full dark:bg-indigo-800/50 bg-gray-500/50" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 rounded w-1/3 dark:bg-indigo-800/50 bg-gray-500/50" />
                                <div className="h-4 rounded w-3/4 dark:bg-indigo-800/50 bg-gray-500/50" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 font-sans antialiased">
            <div className="max-w-4xl mx-auto">
                {/* ✅ Sticky Header */}
                <header className="sticky top-0 z-10 bg-opacity-40 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-2xl border dark:bg-slate-800 border-indigo-500/30 bg-white/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-8 w-8 dark:text-violet-400 text-blue-600" />
                            <h1 className="text-2xl sm:text-3xl font-bold dark:text-gray-100 text-gray-900">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-sm px-2 py-1 rounded-full dark:bg-violet-500 bg-blue-500 text-white">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* ✅ Action Buttons */}
                        <div className="flex flex-wrap gap-2 justify-end">
                            <button
                                onClick={clearAllNotifications}
                                className="text-gray-100 flex items-center px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl dark:bg-violet-600 hover:bg-violet-700 bg-blue-500 hover:bg-blue-600"
                            >
                                <RefreshCw className="h-5 w-5 mr-2" /> Refresh
                            </button>
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className={`text-gray-100 flex items-center px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl ${unreadCount === 0
                                        ? "dark:bg-gray-500/30 bg-gray-900/90 cursor-not-allowed"
                                        : "dark:bg-green-600 dark:hover:bg-green-700 bg-green-500 hover:bg-green-600"
                                    }`}
                            >
                                <BellOff className="h-5 w-5 mr-2" /> Mark All Read
                            </button>
                            <button
                                onClick={clearAllNotifications}
                                disabled={notifications.length === 0}
                                className={` text-gray-100 flex items-center px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl ${notifications.length === 0
                                        ? "dark:bg-gray-500/30 bg-gray-900/90 cursor-not-allowed"
                                        : "dark:bg-red-600 dark:hover:bg-red-700 bg-red-500 hover:bg-red-600"
                                    }`}
                            >
                                <X className="h-5 w-5 mr-2" /> Clear All
                            </button>
                        </div>
                    </div>

                    {/* ✅ Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 dark:text-gray-100 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 dark:placeholder-gray-300 placeholder-gray-600 border rounded-lg focus:outline-none focus:border-violet-500 dark:text-gray-100 dark:bg-slate-800/30 bg-white/30"
                            />
                        </div>
                        <div className="relative w-full sm:w-40">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 dark:text-gray-100 text-gray-600" />
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value as "All" | "Unread" | "Read")
                                }
                                className="w-full pl-10 pr-8 py-2 rounded-lg appearance-none focus:outline-none focus:border-violet-500 bg-indigo-800/30 bg-indigo-900/90 text-white"
                            >
                                <option value="All">All Status</option>
                                <option value="Unread">Unread</option>
                                <option value="Read">Read</option>
                            </select>
                        </div>
                        <div className="relative w-full sm:w-40">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 dark:text-gray-100 text-gray-600" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 rounded-lg appearance-none focus:outline-none focus:border-violet-500 dark:bg-indigo-800/30 bg-indigo-900/90 text-white"
                            >
                                {uniqueTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {/* ✅ Notifications List */}
                <AnimatePresence>
                    <div className="space-y-8">
                        {filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-opacity-20 backdrop-blur-md rounded-xl p-6 sm:p-8 text-center shadow-2xl border dark:bg-indigo-900/20 border-indigo-500/20 bg-blue-200/20"
                            >
                                <Bell className="h-12 w-12 mx-auto mb-4 dark:text-violet-400 text-blue-600" />
                                <p className="text-xl font-semibold dark:text-gray-200 text-gray-800">
                                    All caught up!
                                </p>
                                <p className="dark:text-gray-300 text-gray-600">
                                    No notifications match your filters.
                                </p>
                            </motion.div>
                        ) : (
                            groupOrder.map(
                                (group) =>
                                    grouped[group] && (
                                        <div key={group}>
                                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sticky top-[100px] sm:top-[120px] py-2 dark:text-violet-300 text-blue-700">
                                                {group}
                                            </h2>
                                            <div className="space-y-4">
                                                <AnimatePresence>
                                                    {grouped[group].map((notification) => (
                                                        <motion.div
                                                            key={notification.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className={`bg-opacity-20 backdrop-blur-md rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:space-x-4 shadow-md border transition-all duration-300 hover:shadow-2xl ${notification.read
                                                                    ? "dark:border-indigo-500/20 border-blue-300/20"
                                                                    : "dark:border-violet-500/50 border-blue-500/50"
                                                                }`}
                                                        >
                                                            <div className="flex-shrink-0 relative mb-3 sm:mb-0">
                                                                {getIcon(notification.type)}
                                                                {!notification.read && (
                                                                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-ping dark:bg-violet-500 bg-blue-500"></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p
                                                                    className={`font-semibold text-base sm:text-lg ${notification.read
                                                                            ? "dark:text-gray-400 text-gray-600"
                                                                            : "dark:text-gray-100 text-gray-900"
                                                                        }`}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: notification.message,
                                                                    }}
                                                                />
                                                                {notification.descriptions && (
                                                                    <p
                                                                        className={`mt-2 text-sm ${notification.read
                                                                                ? "text-gray-500"
                                                                                : "dark:text-gray-300 text-gray-700"
                                                                            }`}
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: notification.descriptions,
                                                                        }}
                                                                    />
                                                                )}
                                                                <p className="text-xs mt-2 dark:text-gray-500 text-gray-600">
                                                                    {formatRelativeTime(notification.timestamp)}
                                                                </p>
                                                            </div>

                                                            {/* ✅ Action Buttons (responsive) */}
                                                            <div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0 sm:ml-auto">
                                                                {!notification.read && (
                                                                    <button
                                                                        onClick={() => markAsRead(notification.id)}
                                                                        className="px-3 py-1 text-sm rounded-md transition-all duration-300 shadow-sm hover:shadow-md dark:bg-green-600 dark:hover:bg-green-700 bg-green-500 hover:bg-green-600 text-green-900 dark:text-gray-100"
                                                                    >
                                                                        Read
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => deleteNotification(notification.id)}
                                                                    className="p-1 rounded-full transition-colors duration-300 dark:text-gray-400 dark:hover:text-red-400 hover:text-red-500"
                                                                    aria-label="Delete notification"
                                                                >
                                                                    <X className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )
                            )
                        )}
                    </div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default App;
