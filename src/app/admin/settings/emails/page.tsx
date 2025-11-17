'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Building, MonitorSpeaker, Sparkles } from 'lucide-react';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';
import { JOINING_TEMPLATE } from "@/email-templates/joining";
import { WARNING_TEMPLATE } from "@/email-templates/warning";
import { EXPERIENCE_TEMPLATE } from "@/email-templates/experience";
import { RESET_TEMPLATE } from "@/email-templates/resetPassword";
import { REG_TEMPLATE } from "@/email-templates/registration";
import { BULK_TEMPLATE } from "@/email-templates/bulk";
import DraggableBox from '@/components/common/DragList';

const defaultValues = {
  bulk_email_template: {
    allowed: true,
    subject: 'Important Update',
    body: BULK_TEMPLATE,
  },
  joining_email_template: {
    allowed: true,
    subject: 'Joining Letter',
    body: JOINING_TEMPLATE,
  },
  reset_password_email_template: {
    allowed: true,
    subject: 'Reset Your Password',
    body: RESET_TEMPLATE,
  },
  registration_email_template: {
    allowed: true,
    subject: 'Congratulations on Your Registration!',
    body: REG_TEMPLATE,
  },
  warning_email_template: {
    allowed: true,
    subject: 'Official Warning Regarding Conduct',
    body: WARNING_TEMPLATE,
  },
  experience_email_template: {
    allowed: true,
    subject: 'Experience Letter',
    body: EXPERIENCE_TEMPLATE,
  },

};

const LabeledInput = ({ id, label, icon: Icon, error, ...props }) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="text-sm font-semibold text-gray-700 flex items-center"
    >
      {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
      {label}
      {props.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id}
      {...props}
      className={`w-full px-4 py-2 border-2 rounded-lg shadow-sm focus:outline-none transition duration-150 ease-in-out ${error
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200 focus:border-indigo-500'
        } disabled:bg-gray-100 disabled:text-gray-500`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-500 font-medium">{error.body}</p>
    )}
  </div>
);

export default function SettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [body, setBody] = useState(defaultValues.bulk_email_template.body);
  const [joiningbody, setJoiningBody] = useState(defaultValues.joining_email_template.body);
  const [resetpasswordbody, setResetPasswordBody] = useState(defaultValues.reset_password_email_template.body);
  const [registrationbody, setRegistrationBody] = useState(defaultValues.registration_email_template.body);
  const [warningbody, setWarningBody] = useState(defaultValues.warning_email_template.body);
  const [experiencenbody, setExperienceBody] = useState(defaultValues.experience_email_template.body);


  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  const bulkEmailTemplateAllowed = watch('bulk_email_template.allowed');
  const joiningEmailTemplateAllowed = watch('joining_email_template.allowed');
  const resetEmailTemplateAllowed = watch('reset_password_email_template.allowed');
  const registrationEmailTemplateAllowed = watch('registration_email_template.allowed');
  const warningEmailTemplateAllowed = watch('warning_email_template.allowed');
  const experienceEmailTemplateAllowed = watch('experience_email_template.allowed');


  // ✅ Fetch existing settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);

      const data = await res.json();

      reset({
        bulk_email_template: {
          allowed: data.data.bulk_email_template?.allowed ?? true,
          subject:
            data.data.bulk_email_template?.subject ??
            defaultValues.bulk_email_template.subject,
          body:
            data.data.bulk_email_template?.body ??
            defaultValues.bulk_email_template.body,
        },
        joining_email_template: {
          allowed: data.data.joining_email_template?.allowed ?? true,
          subject:
            data.data.joining_email_template?.subject ??
            defaultValues.joining_email_template.subject,
          body:
            data.data.joining_email_template?.body ??
            defaultValues.joining_email_template.body,
        },
        reset_password_email_template: {
          allowed: data.data.reset_password_email_template?.allowed ?? true,
          subject:
            data.data.reset_password_email_template?.subject ??
            defaultValues.reset_password_email_template.subject,
          body:
            data.data.reset_password_email_template?.body ??
            defaultValues.reset_password_email_template.body,
        },
        registration_email_template: {
          allowed: data.data.registration_email_template?.allowed ?? true,
          subject:
            data.data.registration_email_template?.subject ??
            defaultValues.registration_email_template.subject,
          body:
            data.data.registration_email_template?.body ??
            defaultValues.registration_email_template.body,
        },
        warning_email_template: {
          allowed: data.data.warning_email_template?.allowed ?? true,
          subject:
            data.data.warning_email_template?.subject ??
            defaultValues.warning_email_template.subject,
          body:
            data.data.warning_email_template?.body ??
            defaultValues.warning_email_template.body,
        },
        experience_email_template: {
          allowed: data.data.experience_email_template?.allowed ?? true,
          subject:
            data.data.experience_email_template?.subject ??
            defaultValues.experience_email_template.subject,
          body:
            data.data.experience_email_template?.body ??
            defaultValues.experience_email_template.body,
        },
      });

      setBody(
        data.data.bulk_email_template?.body ??
        defaultValues.bulk_email_template.body
      );
      setJoiningBody(data.data.joining_email_template?.body ??
        defaultValues.joining_email_template.body);
      setResetPasswordBody(data.data.reset_password_email_template?.body ??
        defaultValues.reset_password_email_template.body);
      setRegistrationBody(data.data.registration_email_template?.body ??
        defaultValues.registration_email_template.body);
      setWarningBody(data.data.warning_email_template?.body ??
        defaultValues.warning_email_template.body);
      setExperienceBody(data.data.experience_email_template?.body ??
        defaultValues.experience_email_template.body);

    } catch (err) {
      console.error('Fetch settings failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Run once when page loads
  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ Submit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log("DATA>>>>>>>>>>>", data)

    try {
      const formData = new FormData();
      formData.append(
        'bulk_email_template[allowed]',
        data.bulk_email_template.allowed
      );
      formData.append(
        'bulk_email_template[body]',
        body || defaultValues.bulk_email_template.body
      );
      formData.append(
        'bulk_email_template[subject]',
        data.bulk_email_template.subject || defaultValues.bulk_email_template.subject
      );
      // For Joining Letter
      formData.append(
        'joining_email_template[allowed]',
        data.joining_email_template.allowed
      );
      formData.append(
        'joining_email_template[body]',
        joiningbody || defaultValues.joining_email_template.body
      );
      formData.append(
        'joining_email_template[subject]',
        data.joining_email_template.subject || defaultValues.joining_email_template.subject
      );

      // For Reset Password 
      formData.append(
        'reset_password_email_template[allowed]',
        data.reset_password_email_template.allowed
      );
      formData.append(
        'reset_password_email_template[body]',
        resetpasswordbody || defaultValues.reset_password_email_template.body
      );
      formData.append(
        'reset_password_email_template[subject]',
        data.reset_password_email_template.subject || defaultValues.reset_password_email_template.subject
      );

      // For Registration Confirmation
      formData.append(
        'registration_email_template[allowed]',
        data.registration_email_template.allowed
      );
      formData.append(
        'registration_email_template[body]',
        registrationbody || defaultValues.registration_email_template.body
      );
      formData.append(
        'registration_email_template[subject]',
        data.registration_email_template.subject || defaultValues.registration_email_template.subject
      );

      // For Warning Email Template
      formData.append(
        'warning_email_template[allowed]',
        data.warning_email_template.allowed
      );
      formData.append(
        'warning_email_template[body]',
        registrationbody || defaultValues.warning_email_template.body
      );
      formData.append(
        'warning_email_template[subject]',
        data.warning_email_template.subject || defaultValues.warning_email_template.subject
      );
      // For Experience Letter Email Template
      formData.append(
        'experience_email_template[allowed]',
        data.experience_email_template.allowed
      );
      formData.append(
        'experience_email_template[body]',
        registrationbody || defaultValues.experience_email_template.body
      );
      formData.append(
        'experience_email_template[subject]',
        data.experience_email_template.subject || defaultValues.experience_email_template.subject
      );


      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`Submission failed: ${res.status}`);

      console.log('✅ Settings updated successfully');
      await fetchSettings();
    } catch (error) {
      console.error('Submission Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Loading settings...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden p-8 sm:p-10">
      <DraggableBox />

      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Sparkles className="w-7 h-7 mr-3 text-indigo-600" />
          Email Settings
        </h2>
        <p className="text-gray-500 mt-1">
          Manage your email templates and configurations.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* --- Bulk Email Template Section --- */}

        <section className="p-6 border-l-4 border-yellow-500 rounded-xl bg-yellow-50 shadow-md">
          <h3 className="text-xl font-bold mb-5 text-yellow-800 flex items-center">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Bulk Email
          </h3>

          <div className="grid grid-cols-1 gap-6 items-start">
            {/* Toggle */}
            <Controller
              name="bulk_email_template.allowed"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {field.value
                      ? 'Bulk Email Enabled'
                      : 'Bulk Email Disabled'}
                  </span>
                </label>
              )}
            />

            {/* Title Input */}
            <LabeledInput
              id="bulk_title"
              label="Mail Subject"
              icon={Building}
              type="text"
              disabled={!bulkEmailTemplateAllowed}
              {...register('bulk_email_template.subject')}
            />

            {/* Email Body Editor */}
            <Controller
              name="bulk_email_template.body"
              control={control}
              render={() => (
                <SummernoteEditor
                  value={body}
                  onChange={setBody}
                  height={150}
                  disabled={!bulkEmailTemplateAllowed}
                  placeholder="Compose your bulk email template here..."
                />
              )}
            />
          </div>
        </section>
        {/* Joining Letter Mail */}
        <section className="p-6 border-l-4 border-green-500 rounded-xl bg-green-50 shadow-md">
          <h3 className="text-xl font-bold mb-5 text-green-800 flex items-center">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Joining Letter Email
          </h3>

          <div className="grid grid-cols-1 gap-6 items-start">
            {/* Toggle */}
            <Controller
              name="joining_email_template.allowed"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {field.value
                      ? 'Joining Email Enabled'
                      : 'Joining Email Disabled'}
                  </span>
                </label>
              )}
            />

            {/* Title Input */}
            <LabeledInput
              id="joining_title"
              label="Mail Subject"
              icon={Building}
              type="text"
              disabled={!joiningEmailTemplateAllowed}
              {...register('joining_email_template.subject')}
            />

            {/* Email Body Editor */}
            <Controller
              name="joining_email_template.body"
              control={control}
              render={() => (
                <SummernoteEditor
                  value={joiningbody}
                  onChange={setJoiningBody}
                  height={150}
                  disabled={!joiningEmailTemplateAllowed}
                  placeholder="Compose your joining email template here..."
                />
              )}
            />
          </div>
        </section>
        {/* Forget Password OTP Mail */}
        <section className="p-6 border-l-4 border-pink-500 rounded-xl bg-pink-50 shadow-md">
          <h3 className="text-xl font-bold mb-5 text-pink-800 flex items-center">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Reset Password Email
          </h3>

          <div className="grid grid-cols-1 gap-6 items-start">
            {/* Toggle */}
            <Controller
              name="reset_password_email_template.allowed"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {field.value
                      ? 'Reset Password Email Enabled'
                      : 'Reset Password Email Disabled'}
                  </span>
                </label>
              )}
            />

            {/* Title Input */}
            <LabeledInput
              id="reset_password_title"
              label="Mail Subject"
              icon={Building}
              type="text"
              disabled={!resetEmailTemplateAllowed}
              {...register('reset_password_email_template.subject')}
            />

            {/* Email Body Editor */}
            <Controller
              name="reset_password_email_template.body"
              control={control}
              render={() => (
                <SummernoteEditor
                  value={resetpasswordbody}
                  onChange={setResetPasswordBody}
                  height={150}
                  disabled={!resetEmailTemplateAllowed}
                  placeholder="Compose your bulk email template here..."
                />
              )}
            />
          </div>
        </section>
        {/* Registration Confirmation Mail */}
        <section className="p-6 border-l-4 border-blue-500 rounded-xl bg-blue-50 shadow-md">
          <h3 className="text-xl font-bold mb-5 text-blue-800 flex items-center">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Registration Confirmation Email
          </h3>

          <div className="grid grid-cols-1 gap-6 items-start">
            {/* Toggle */}
            <Controller
              name="registration_email_template.allowed"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {field.value
                      ? 'Registration Confirmation Email Enabled'
                      : 'Registration Confirmation Email Disabled'}
                  </span>
                </label>
              )}
            />

            {/* Title Input */}
            <LabeledInput
              id="registration_email_template_title"
              label="Mail Subject"
              icon={Building}
              type="text"
              disabled={!registrationEmailTemplateAllowed}
              {...register('registration_email_template.subject')}
            />

            {/* Email Body Editor */}
            <Controller
              name="registration_email_template.body"
              control={control}
              render={() => (
                <SummernoteEditor
                  value={registrationbody}
                  onChange={setRegistrationBody}
                  height={150}
                  disabled={!registrationEmailTemplateAllowed}
                  placeholder="Compose your bulk email template here..."
                />
              )}
            />
          </div>
        </section>
        <section className="p-6 border-l-4 border-red-500 rounded-xl bg-red-50 shadow-md">

          <h3 className="text-xl font-bold mb-5 text-red-800 flex items-center">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Warning Email
          </h3>

          <div className="grid grid-cols-1 gap-6 items-start">
            {/* Toggle */}
            <Controller
              name="warning_email_template.allowed"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {field.value
                      ? 'Warning Email Enabled'
                      : 'Warning Email Disabled'}
                  </span>
                </label>
              )}
            />

            {/* Title Input */}
            <LabeledInput
              id="warning_title"
              label="Mail Subject"
              icon={Building}
              type="text"
              disabled={!warningEmailTemplateAllowed}
              {...register('warning_email_template.subject')}
            />

            {/* Email Body Editor */}
            <Controller
              name="warning_email_template.body"
              control={control}
              render={() => (
                <SummernoteEditor
                  value={warningbody}
                  onChange={setWarningBody}
                  height={150}
                  disabled={!warningEmailTemplateAllowed}
                  placeholder="Compose your bulk email template here..."
                />
              )}
            />
          </div>
        </section>


        <section className="p-6 border-l-4 border-yellow-500 rounded-xl bg-yellow-50 shadow-md">
          <h3 className="text-xl font-bold mb-5 text-yellow-800 flex items-center">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Experience Letter Email
          </h3>

          <div className="grid grid-cols-1 gap-6 items-start">
            {/* Toggle */}
            <Controller
              name="experience_email_template.allowed"
              control={control}
              render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {field.value
                      ? 'Experience Letter Email Enabled'
                      : 'Experience Letter  Email Disabled'}
                  </span>
                </label>
              )}
            />

            {/* Title Input */}
            <LabeledInput
              id="experience_email_template_title"
              label="Mail Subject"
              icon={Building}
              type="text"
              disabled={!experienceEmailTemplateAllowed}
              {...register('experience_email_template.subject')}
            />

            {/* Email Body Editor */}
            <Controller
              name="experience_email_template.body"
              control={control}
              render={() => (
                <SummernoteEditor
                  value={experiencenbody}
                  onChange={setExperienceBody}
                  height={150}
                  disabled={!experienceEmailTemplateAllowed}
                  placeholder="Compose your bulk email template here..."
                />
              )}
            />
          </div>
        </section>


        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-200 ease-in-out disabled:bg-gray-400 disabled:shadow-none"
          >
            {isSubmitting ? 'Saving Configuration...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
