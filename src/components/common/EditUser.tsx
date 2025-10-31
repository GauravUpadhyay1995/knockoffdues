'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import ProfileDrawer from "./ProfileDrawer";
import AccordionSection from '@/components/users/AccordionSection';
import StatusBadges from '@/components/users/StatusBadges';
import StatusRoleSection from "@/components/users/StatusRoleSection";
import FormSection from '@/components/users/FormSection';
import SubmitButton from '@/components/users/SubmitButton';
import SuccessMessage from '@/components/users/SuccessMessage';
import LoadingSpinner from '@/components/users/LoadingSpinner';
import { useUserData } from '@/hooks/useUserData';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { UserData, AccordionSection as AccordionSectionType } from '@/types';
import { accordionSectionsConfig } from '@/config/accordionSections';
import { statusFieldsConfig } from '@/config/statusFields';
import Letters from '@/components/common/Letters';

export default function UserEditForm() {
    const params = useParams();
    const userId = params.id as string;
    const loggedInUserData = JSON.parse(localStorage.getItem('admin') || '{}');

    const { user, departments, roleList, loading, error, refresh } = useUserData(userId);

    // rename handleSubmit from custom hook
    const { isSubmitting, submitSuccess, handleSubmit: handleFormSubmit } = useFormSubmission(userId, user);

    const { register, control, reset, watch, handleSubmit, formState: { errors } } = useForm<UserData>();

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        personal: true,
        contact: false,
        professional: false,
        family: false,
        health: false,
        recruiter: false,
        academics: false,
        experience: false,
        documents: false,
    });

    const [activeTab, setActiveTab] = useState<'profile' | 'letters'>('profile');

    // Field arrays
    const { fields: academicFields, append: appendAcademic, remove: removeAcademic } = useFieldArray({ control, name: "academics" });
    const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control, name: "workExperience" });
    const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({ control, name: "documents" });

    useEffect(() => {
        if (user) {
            reset(user);
        }
    }, [user, reset]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };


    const onSubmit = async (data: UserData) => {
        await handleFormSubmit(data); // send real data to your custom hook
        refresh(); // refresh user data automatically

    };
    //      const onSubmit = async (data: UserData) => {
    //     await submitForm(data); // submit form
    //     refresh(); // refresh user data automatically
    //     toast.success('User data refreshed!');
    //   };



    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-8xl mx-auto p-4 md:p-6"
        >
            <AnimatePresence>
                {submitSuccess && <SuccessMessage />}
            </AnimatePresence>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:bg-gray-900"
            >
                {/* Header */}
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">{user.name}'s Profile</h2>
                            <p className="text-gray-900 dark:text-gray-100 mt-1">
                                Update {user.name}'s information and preferences
                            </p>
                        </div>
                        <StatusBadges user={user} />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                        {(['profile', 'letters'] as const).map(tab => (
                            <button
                                key={tab}
                                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 dark:bg-gray-900">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Render accordion sections */}
                            {accordionSectionsConfig.map(section => (
                                <FormSection
                                    key={section.id}
                                    section={section}
                                    isOpen={openSections[section.id]}
                                    onToggle={() => toggleSection(section.id)}
                                    user={user}
                                    loggedInUserData={loggedInUserData}
                                    register={register}
                                    control={control}
                                    errors={errors}
                                    departments={departments}
                                    roleList={roleList}
                                    academicFields={academicFields}
                                    experienceFields={experienceFields}
                                    documentFields={documentFields}
                                    appendAcademic={appendAcademic}
                                    removeAcademic={removeAcademic}
                                    appendExperience={appendExperience}
                                    removeExperience={removeExperience}
                                    appendDocument={appendDocument}
                                    removeDocument={removeDocument}
                                    isSubmitting={isSubmitting}
                                />
                            ))}

                            {/* Status & Role Section */}
                            <StatusRoleSection
                                user={user}
                                loggedInUserData={loggedInUserData}
                                register={register}
                                roleList={roleList}
                            />

                            <SubmitButton isSubmitting={isSubmitting} />
                        </form>
                    )}

                    {
                     
                    
                    activeTab === 'letters' && (
                    <Letters userData={user}  />

                    )}
                </div>
            </motion.div>

            {user && <ProfileDrawer data={{ resume: user.resume, photo: user.avatar }} />}
        </motion.div>
    );
}