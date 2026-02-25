"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Phone, MapPin, Calendar,
    Shield, Edit2, Save, X, Camera,
    Globe, Briefcase, CheckCircle,
    Lock, Bell, CreditCard, Upload
} from "lucide-react";
import Swal from 'sweetalert2';

export default function UserProfilePage({ userData = {} }: any) {
    // Default user data structure
    const defaultUser = {
        id: "USR-001",
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        role: "Administrator",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        joinDate: "2023-05-15",
        bio: "Senior Administrator with full system access and team management responsibilities.",
        permissions: 42,
        lastActive: "2024-02-20 14:30",
        status: "active",
        department: "IT Management",
        timezone: "PST (UTC-8)",
        language: "English",
        notificationSettings: {
            email: true,
            push: true,
            sms: false,
            weeklyDigest: true
        },
        twoFactorEnabled: true
    };

    const [user, setUser] = useState({ ...defaultUser, ...userData });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);

    // Initialize edit form with current user data
    useEffect(() => {
        if (isEditing) {
            setEditForm({
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                department: user.department,
                timezone: user.timezone,
                language: user.language
            });
        }
    }, [isEditing, user]);

    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setEditForm({
            ...editForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        setUser(prev => ({
            ...prev,
            ...editForm
        }));

        setIsLoading(false);
        setIsEditing(false);

        Swal.fire({
            icon: 'success',
            title: 'Profile Updated!',
            text: 'Your changes have been saved successfully.',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleAvatarUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Create local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
            setIsUploading(false);

            Swal.fire({
                icon: 'success',
                title: 'Avatar Updated!',
                text: 'Your profile picture has been updated.',
                timer: 1500,
                showConfirmButton: false
            });
        };
        reader.readAsDataURL(file);
    };

    const toggleTwoFactor = async () => {
        const result = await Swal.fire({
            title: user.twoFactorEnabled ? 'Disable 2FA?' : 'Enable 2FA?',
            text: user.twoFactorEnabled
                ? 'This will reduce your account security.'
                : 'Add an extra layer of security to your account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, proceed'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));

            setUser(prev => ({
                ...prev,
                twoFactorEnabled: !prev.twoFactorEnabled
            }));

            setIsLoading(false);

            Swal.fire({
                icon: 'success',
                title: user.twoFactorEnabled ? '2FA Disabled' : '2FA Enabled!',
                text: user.twoFactorEnabled
                    ? 'Two-factor authentication has been disabled.'
                    : 'Two-factor authentication is now active.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "billing", label: "Billing", icon: CreditCard }
    ];

    // Reusable SectionCard component using your dark/light mode classes
    const SectionCard = ({ children, title, icon }: any) => (
        <div className="relative backdrop-blur-2xl  dark:bg-white/5 border border-white/8 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/6">
                        {icon}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
            </div>
            <div className="p-1">{children}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative rounded-3xl p-6 bg-gradient-to-r from-white to-gray-100 dark:from-white/5 dark:to-white/3 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                                            <img
                                                src={avatarPreview}
                                                alt={user.name}
                                                className="w-full h-full rounded-2xl object-cover"
                                            />
                                        </div>
                                        <label className="absolute bottom-2 right-2 bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-800 transition-all group-hover:scale-110">
                                            <Camera className="w-4 h-4 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`} />
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">{user.bio}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:scale-105 transform transition-all flex items-center gap-2"
                                >
                                    {isEditing ? (
                                        <>
                                            <X className="w-4 h-4" />
                                            Cancel Edit
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <SectionCard title="Profile Navigation" icon={<User className="w-6 h-6 text-purple-500 dark:text-purple-300" />}>
                            <div className="flex space-x-1 p-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-700 dark:text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </SectionCard>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === "profile" && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <SectionCard title="Profile Information" icon={<User className="w-6 h-6 text-blue-500 dark:text-blue-300" />}>
                                        {isEditing ? (
                                            <div className="space-y-6 p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editForm.name}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={editForm.email}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={editForm.phone}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={editForm.location}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                                                        <textarea
                                                            name="bio"
                                                            value={editForm.bio}
                                                            onChange={handleInputChange}
                                                            rows={3}
                                                            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isLoading}
                                                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transform transition-all disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="w-4 h-4" />
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                <InfoCard
                                                    icon={Mail}
                                                    label="Email"
                                                    value={user.email}
                                                    color="purple"
                                                />
                                                <InfoCard
                                                    icon={Phone}
                                                    label="Phone"
                                                    value={user.phone}
                                                    color="blue"
                                                />
                                                <InfoCard
                                                    icon={MapPin}
                                                    label="Location"
                                                    value={user.location}
                                                    color="emerald"
                                                />
                                                <InfoCard
                                                    icon={Calendar}
                                                    label="Member Since"
                                                    value={new Date(user.joinDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                    color="amber"
                                                />
                                                <InfoCard
                                                    icon={Briefcase}
                                                    label="Department"
                                                    value={user.department}
                                                    color="pink"
                                                />
                                                <InfoCard
                                                    icon={Globe}
                                                    label="Timezone"
                                                    value={user.timezone}
                                                    color="cyan"
                                                />
                                            </div>
                                        )}
                                    </SectionCard>
                                </motion.div>
                            )}

                            {activeTab === "security" && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <SectionCard title="Security Settings" icon={<Lock className="w-6 h-6 text-red-500 dark:text-red-300" />}>
                                        <div className="space-y-4 p-4">
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                                        <Lock className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={toggleTwoFactor}
                                                    disabled={isLoading}
                                                    className={`px-4 py-2 rounded-lg font-medium ${user.twoFactorEnabled
                                                        ? 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30'
                                                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30'
                                                        }`}
                                                >
                                                    {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">Current Session</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">San Francisco, CA • Chrome on Windows</div>
                                                        </div>
                                                        <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Active now</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SectionCard>
                                </motion.div>
                            )}

                            {activeTab === "notifications" && (
                                <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <SectionCard title="Notification Preferences" icon={<Bell className="w-6 h-6 text-yellow-500 dark:text-yellow-300" />}>
                                        <div className="space-y-4 p-4">
                                            {Object.entries(user.notificationSettings).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {key === 'email' && 'Receive notifications via email'}
                                                            {key === 'push' && 'Receive push notifications'}
                                                            {key === 'sms' && 'Receive SMS notifications'}
                                                            {key === 'weeklyDigest' && 'Receive weekly summary emails'}
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={value as boolean}
                                                            onChange={() => setUser(prev => ({
                                                                ...prev,
                                                                notificationSettings: {
                                                                    ...prev.notificationSettings,
                                                                    [key]: !value
                                                                }
                                                            }))}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </SectionCard>
                                </motion.div>
                            )}

                            {activeTab === "billing" && (
                                <motion.div
                                    key="billing"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <SectionCard title="Billing Information" icon={<CreditCard className="w-6 h-6 text-green-500 dark:text-green-300" />}>
                                        <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Enterprise Plan</h4>
                                                    <p className="text-gray-700 dark:text-gray-300">All features included</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">$99<span className="text-gray-600 dark:text-gray-300 text-sm">/month</span></div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Next billing: Mar 15, 2024</div>
                                                </div>
                                            </div>
                                            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all">
                                                Manage Subscription
                                            </button>
                                        </div>
                                    </SectionCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column - Stats & Quick Actions */}
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <SectionCard title="Quick Stats" icon={<Shield className="w-6 h-6 text-purple-500 dark:text-purple-300" />}>
                            <div className="space-y-4 p-4">
                                <StatCard
                                    icon={Shield}
                                    label="Permissions"
                                    value={user.permissions}
                                    color="purple"
                                    change="+2 this month"
                                />
                                <StatCard
                                    icon={CheckCircle}
                                    label="Active Sessions"
                                    value="1"
                                    color="emerald"
                                    change="Current device"
                                />
                                <StatCard
                                    icon={Calendar}
                                    label="Days Active"
                                    value={Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 3600 * 24))}
                                    color="blue"
                                    change="Total"
                                />
                            </div>
                        </SectionCard>

                        {/* Quick Actions */}
                        <SectionCard title="Quick Actions" icon={<Upload className="w-6 h-6 text-blue-500 dark:text-blue-300" />}>
                            <div className="space-y-3 p-4">
                                <QuickActionButton
                                    icon={Upload}
                                    label="Upload Avatar"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                />
                                <QuickActionButton
                                    icon={Mail}
                                    label="Change Email"
                                    onClick={() => setIsEditing(true)}
                                />
                                <QuickActionButton
                                    icon={Lock}
                                    label="Change Password"
                                    onClick={() => setActiveTab('security')}
                                />
                                <QuickActionButton
                                    icon={Bell}
                                    label="Notification Settings"
                                    onClick={() => setActiveTab('notifications')}
                                />
                            </div>
                        </SectionCard>

                        {/* Recent Activity */}
                        <SectionCard title="Recent Activity" icon={<Calendar className="w-6 h-6 text-amber-500 dark:text-amber-300" />}>
                            <div className="space-y-4 p-4">
                                <ActivityItem
                                    time="2 hours ago"
                                    action="Updated profile information"
                                    color="emerald"
                                />
                                <ActivityItem
                                    time="Yesterday"
                                    action="Changed password"
                                    color="blue"
                                />
                                <ActivityItem
                                    time="3 days ago"
                                    action="Logged in from new device"
                                    color="amber"
                                />
                                <ActivityItem
                                    time="1 week ago"
                                    action="Updated notification settings"
                                    color="purple"
                                />
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Hidden file input for avatar upload */}
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                />
            </div>
        </div>
    );
}

// Updated reusable components with dark/light mode support
const InfoCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex items-start gap-4 p-4 bg-white/3 rounded-xl hover:bg-white/5 transition-all">
        <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
            <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
            <div className="text-gray-900 dark:text-white font-medium">{value}</div>
        </div>
    </div>
);

const StatCard = ({ icon: Icon, label, value, color, change }: any) => (
    <div className="p-4 bg-white/3 rounded-xl hover:bg-white/5 transition-all">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                </div>
            </div>
            <div className={`text-xs ${change.includes('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {change}
            </div>
        </div>
    </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }: any) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all group"
    >
        <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all">
            <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="text-gray-900 dark:text-white font-medium">{label}</span>
    </button>
);

const ActivityItem = ({ time, action, color }: any) => (
    <div className="flex items-center gap-3">
        <div className="relative">
            <div className={`w-2 h-2 bg-${color}-500 dark:bg-${color}-400 rounded-full`} />
            <div className="absolute top-2 left-1 w-0.5 h-6 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
        <div className="flex-1">
            <div className="text-gray-900 dark:text-white">{action}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{time}</div>
        </div>
    </div>
);