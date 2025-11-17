import mongoose from 'mongoose';
import { JOINING_TEMPLATE } from "@/email-templates/joining";
import { WARNING_TEMPLATE } from "@/email-templates/warning";
import { EXPERIENCE_TEMPLATE } from "@/email-templates/experience";
import { RESET_TEMPLATE } from "@/email-templates/resetPassword";
import { REG_TEMPLATE } from "@/email-templates/registration";
import { BULK_TEMPLATE } from "@/email-templates/bulk";
const mailConfigSchema = new mongoose.Schema({

    bulk_email_template: {
        allowed: { type: Boolean, required: true, default: true },
        subject: { type: String, required: true, default: "Important Update" },
        body: { type: String, required: true, default: BULK_TEMPLATE },
    },
    joining_email_template: {
        allowed: { type: Boolean, required: true, default: true },
        subject: { type: String, required: true, default: "Joining Letter" },
        body: {
            type: String, required: true, default: JOINING_TEMPLATE
        },
    },
    reset_password_email_template: {
        allowed: { type: Boolean, required: true, default: true },
        subject: { type: String, required: true, default: "Reset Your Password" },
        body: {
            type: String, required: true, default: RESET_TEMPLATE
        },
    },
    registration_email_template: {
        allowed: { type: Boolean, required: true, default: true },
        subject: { type: String, required: true, default: "Congratulations on Your Registration!" },
        body: {
            type: String, required: true, default: REG_TEMPLATE
        },
    },
    experience_email_template: {
        allowed: { type: Boolean, required: true, default: true },
        subject: { type: String, required: true, default: "Experience Letter" },
        body: {
            type: String, required: true, default: EXPERIENCE_TEMPLATE
        },
    },
    warning_email_template: {
        allowed: { type: Boolean, required: true, default: true },
        subject: { type: String, required: true, default: "Official Warning Regarding Conduct" },
        body: {
            type: String, required: true, default: WARNING_TEMPLATE
        },
    },


}, { timestamps: true });


export const MailConfig = mongoose.models.MailConfig || mongoose.model('MailConfig', mailConfigSchema);
