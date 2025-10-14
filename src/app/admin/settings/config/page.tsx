// components/SettingsForm.js
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Phone,
    Building,
    DollarSign,
    Image as ImageIcon,
    Sparkles,
} from 'lucide-react';

const defaultValues = {
    companyName: '',
    companyEmail: '',
    companyWhatsapp: '',
    companyLogo: null,
    companyAddress: "",
    companyFavicon: null,
};

const LabeledInput = ({ id, label, icon: Icon, error, ...props }) => (
    <div className="space-y-1">
        <label
            htmlFor={id}
            className="text-sm font-semibold text-gray-700 flex items-center dark:text-gray-100"
        >
            {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            <input
                id={id}
                {...props}
                className={`w-full px-4 py-2 border-2 rounded-lg shadow-sm focus:outline-none transition duration-150 ease-in-out ${error
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-indigo-500'
                    } disabled:bg-gray-100 disabled:text-gray-500`}
            />
        </div>
        {error && (
            <p className="mt-1 text-xs text-red-500 font-medium">{error.message}</p>
        )}
    </div>
);

const SettingsForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm({
        defaultValues,
    });

    // ✅ Fetch and set settings
    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/config`, {
                credentials: 'include',
            });
            const data = await res.json();

            reset({
                ...defaultValues,
                ...data.data,
            });

            if (data.data.companyLogo) setLogoPreview(data.data.companyLogo);
            if (data.data.companyFavicon) setFaviconPreview(data.data.companyFavicon);
        } catch (err) {
            console.error('Fetch settings failed', err);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchSettings();
    }, [reset]);

    // ✅ Submit handler
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('companyName', data.companyName);
        formData.append('companyEmail', data.companyEmail);
        formData.append('companyWhatsapp', data.companyWhatsapp);
        formData.append('companyAddress', data.companyAddress);

        if (data.companyLogo && data.companyLogo[0]) {
            formData.append('companyLogo', data.companyLogo[0]);
        } else {
            console.log('No company logo selected');
        }
        if (data.companyFavicon && data.companyFavicon[0]) {
            formData.append('companyFavicon', data.companyFavicon[0]);
        } else {
            console.log('No favicon selected');
        }

        // Debug FormData contents
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/config`, {
                method: 'PATCH',
                body: formData,
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Failed to save settings');
            }
            const result = await res.json();
            console.log('RESULT:', result);

            reset({
                companyName: result.data.companyName || '',
                companyEmail: result.data.companyEmail || '',
                companyWhatsapp: result.data.companyWhatsapp || '',
                companyAddress: result.data.companyAddress || '',
                companyLogo: null,
                companyFavicon: null,
            });
            if (result.data.companyLogo) setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}/${result.data.companyLogo}`);
            if (result.data.companyFavicon) setFaviconPreview(`${process.env.NEXT_PUBLIC_API_URL}/${result.data.companyFavicon}`);
        } catch (error) {
            console.error('Submission Error:', error);
            setErrorMessage('Failed to save settings. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ File change live preview
    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit');
                return;
            }
            // Validate file type
            const validLogoTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            const validFaviconTypes = ['image/png', 'image/x-icon'];
            if (type === 'logo' && !validLogoTypes.includes(file.type)) {
                alert('Invalid logo file type. Use PNG, JPG, or JPEG');
                return;
            }
            if (type === 'favicon' && !validFaviconTypes.includes(file.type)) {
                alert('Invalid favicon file type. Use PNG or ICO');
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            if (type === 'logo') setLogoPreview(previewUrl);
            if (type === 'favicon') setFaviconPreview(previewUrl);
        }
    };

    if (isLoading) {
        return (
            <div className="p-10 text-center text-gray-500 font-medium">
                Loading settings...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden p-8 sm:p-10  dark:bg-gray-800">
            <header className="mb-8 border-b pb-4 ">
                <h2 className="text-3xl font-extrabold dark:text-gray-100 text-gray-900 flex items-center">
                    <Sparkles className="w-7 h-7 mr-3 text-indigo-600" />
                    System Configuration
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage core application settings, branding, and default parameters.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* --- 1. Company Details Section --- */}
                <section className="p-6 border border-gray-100 rounded-xl bg-gray-50 shadow-inner dark:border-gray-600  dark:bg-gray-800">
                    <h3 className="text-xl font-bold mb-5 dark:text-gray-100 text-gray-800 border-b pb-2">
                        Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-gray-400">
                        <LabeledInput
                            id="companyName"
                            label="Company Name"
                            icon={Building}
                            type="text"
                            required
                            {...register('companyName', {
                                required: 'Company Name is required',
                                maxLength: { value: 100, message: 'Max 100 characters' },
                            })}
                            error={errors.companyName}
                        />

                        <LabeledInput
                            id="companyEmail"
                            label="Company Email"
                            icon={Mail}
                            type="email"
                            {...register('companyEmail', {
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            error={errors.companyEmail}
                        />

                        <LabeledInput
                            id="companyWhatsapp"
                            label="Company WhatsApp Number"
                            icon={Phone}
                            type="tel"
                            placeholder="+1 555 123 4567"
                            {...register('companyWhatsapp', {
                                pattern: {
                                    value: /^\+?[0-9\s-]*$/,
                                    message:
                                        'Invalid phone format (only digits and + are allowed).',
                                },
                            })}
                            error={errors.companyWhatsapp}
                        />

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 dark:text-gray-400 mt-3">
                        <LabeledInput
                            id="companyAddress"
                            label="Company Address"
                            icon={Phone}
                            type="text"
                            placeholder="Company Address"
                            {...register('companyAddress')}
                            error={errors.companyAddress}
                        />
                    </div>
                </section>

                {/* --- 3. File Uploads Section --- */}
                <section className="p-8 rounded-3xl  shadow-2xl border border-white/60 backdrop-blur-sm relative overflow-hidden dark:bg-gray-800  ">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-200/40 to-purple-300/30 rounded-full -translate-y-20 translate-x-20 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/50 to-cyan-200/40 rounded-full -translate-x-16 translate-y-16 animate-float"></div>

                    <div className="relative z-10 ">
                        {/* Enhanced header */}
                        <div className="flex items-center group mb-8 ">
                            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl mr-4 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                                <ImageIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
                                    Brand Identity Studio
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Upload your visual assets to build brand consistency
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 ">
                            {/* Logo Card */}
                            <Controller
                                name="companyLogo"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 "></div>
                                        <div className="relative bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 p-6 shadow-2xl hover:shadow-3xl transition-all duration-500  dark:bg-gray-800">
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                                                        <span className="text-lg">🎨</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900  dark:text-gray-400  text-lg">Primary Logo</h4>
                                                        <p className="text-xs text-gray-500  dark:text-gray-300 ">Recommended: 512×512px PNG</p>
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200 dark:bg-green-300">
                                                    Required
                                                </div>
                                            </div>

                                            {/* File Input with Icon Upload */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label
                                                        htmlFor="companyLogo"
                                                        className="text-sm font-semibold text-gray-700  dark:text-gray-400 "
                                                    >
                                                        Company Logo (PNG, JPG, JPEG)
                                                    </label>

                                                    {/* Upload Icon */}
                                                    <label
                                                        htmlFor="companyLogo"
                                                        className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center cursor-pointer transform hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-md group/icon"
                                                    >
                                                        <svg className="w-6 h-6 text-white group-hover/icon:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <input
                                                            id="companyLogo"
                                                            type="file"
                                                            accept=".png, .jpg, .jpeg"
                                                            onChange={(e) => {
                                                                onChange(e.target.files);
                                                                handleFileChange(e, 'logo');
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>

                                                {errors.companyLogo && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                        <p className="text-sm text-red-700 font-medium flex items-center">
                                                            <span className="text-lg mr-2">⚠️</span>
                                                            {errors.companyLogo.message}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Enhanced Preview Section */}
                                            {logoPreview && (
                                                <div className="mt-6 animate-fade-in ">
                                                    <div className="flex items-center justify-between mb-4 ">
                                                        <p className="text-sm font-semibold text-gray-700  dark:text-gray-400 ">Logo Preview</p>
                                                        <div className="flex space-x-2">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-xs text-green-600 font-medium">Uploaded</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        {/* App Mockup Preview */}
                                                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-2xl">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                                                    <img src={logoPreview} alt="App Icon" className="w-8 h-8 rounded-lg" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="h-2 bg-gray-700 rounded mb-1"></div>
                                                                    <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs dark:text-gray-400 text-gray-400 text-center mt-3">Mobile App</p>
                                                        </div>

                                                        {/* Website Header Preview */}
                                                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <img src={logoPreview} alt="Website Logo" className="w-8 h-8 rounded" />
                                                                    <div className="text-sm font-semibold text-gray-800">Your Brand</div>
                                                                </div>
                                                                <div className="flex space-x-1">
                                                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                                                </div>
                                                            </div>
                                                            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                                                            <p className="text-xs text-gray-500 text-center mt-3">Website Header</p>
                                                        </div>
                                                    </div>

                                                    {/* Large Preview */}
                                                    <div className="p-4 rounded-xl border border-gray-200  dark:bg-gray-800">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo Preview"
                                                            className="w-32 h-32 mx-auto rounded-2xl shadow-2xl border-4 border-white"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Favicon Card */}
                            <Controller
                                name="companyFavicon"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                        <div className="relative bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 p-6 shadow-2xl hover:shadow-3xl transition-all duration-500  dark:bg-gray-800">
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                                                        <span className="text-lg">🔍</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg dark:text-gray-400">Browser Favicon</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-300">Recommended: 32×32px ICO/PNG</p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-300 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                                                    Recommended
                                                </div>
                                            </div>

                                            {/* File Input with Icon Upload */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label
                                                        htmlFor="companyFavicon"
                                                        className="text-sm font-semibold text-gray-700 dark:text-gray-400"
                                                    >
                                                        Company Favicon (ICO, PNG)
                                                    </label>

                                                    {/* Upload Icon */}
                                                    <label
                                                        htmlFor="companyFavicon"
                                                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center cursor-pointer transform hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-md group/icon"
                                                    >
                                                        <svg className="w-6 h-6 text-white group-hover/icon:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <input
                                                            id="companyFavicon"
                                                            type="file"
                                                            accept=".ico, .png"
                                                            onChange={(e) => {
                                                                onChange(e.target.files);
                                                                handleFileChange(e, 'favicon');
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>

                                                {errors.companyFavicon && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                        <p className="text-sm text-red-700 font-medium flex items-center">
                                                            <span className="text-lg mr-2">⚠️</span>
                                                            {errors.companyFavicon.message}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Enhanced Preview Section */}
                                            {faviconPreview && (
                                                <div className="mt-6 animate-fade-in">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-400">Favicon Preview</p>
                                                        <div className="flex space-x-2">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-xs text-green-600 font-medium">Uploaded</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        {/* Browser Tab Preview */}
                                                        <div className="bg-gray-900 rounded-xl p-4 shadow-2xl">
                                                            <div className="flex items-center space-x-3 mb-3">
                                                                <div className="flex space-x-1">
                                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                                </div>
                                                                <div className="flex-1 bg-gray-700 rounded-lg px-3 py-1 flex items-center space-x-2">
                                                                    <img src={faviconPreview} alt="Favicon" className="w-4 h-4 rounded" />
                                                                    <div className="text-xs text-gray-300">Your Website</div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-400 text-center">Browser Tab</p>
                                                        </div>

                                                        {/* Bookmark Preview */}
                                                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                                                            <div className="flex items-center space-x-3">
                                                                <img src={faviconPreview} alt="Bookmark" className="w-6 h-6 rounded" />
                                                                <div>
                                                                    <div className="text-xs font-semibold text-gray-800">Your Website</div>
                                                                    <div className="text-xs text-gray-500">yourwebsite.com</div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-500 text-center mt-3">Bookmark</p>
                                                        </div>
                                                    </div>

                                                    {/* Size Variations */}
                                                    <div className="p-4  rounded-xl border border-gray-200  dark:bg-gray-800">
                                                        <div className="flex items-center justify-center space-x-6">
                                                            {[16, 32, 48].map((size) => (
                                                                <div key={size} className="text-center">
                                                                    <div className="bg-white  dark:bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-200 mb-2">
                                                                        <img
                                                                            src={faviconPreview}
                                                                            alt={`Favicon ${size}px`}
                                                                            className="rounded"
                                                                            style={{ width: size, height: size }}
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-100">{size}px</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Best Practices Section */}
                        <div className="mt-8 p-6 dark:bg-gray-800 rounded-2xl border border-indigo-100/50 shadow-lg ">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                    <span className="text-white text-lg">💡</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-2 dark:text-gray-100">Best Practices</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            <span>Click the upload icon to select files</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            <span>Use transparent PNG for logos</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            <span>Square format works best</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            <span>High resolution recommended</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Submit Button --- */}
                <div className="flex justify-end mt-8 space-x-4">
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="fixed bottom-6 right-6 px-6 py-3 bg-orange-500 text-white font-medium rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-70 flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Update
                            </>
                        )}
                    </motion.button>
                </div>

                {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SettingsForm;