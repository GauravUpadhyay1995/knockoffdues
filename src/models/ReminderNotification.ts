import mongoose, { Schema } from "mongoose";

const reminderNotificationSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reminderId: { type: mongoose.Schema.Types.ObjectId, ref: "Reminder", required: true },
        message: { type: String, required: true },
        scheduledAt: { type: Date, required: true }, // exact trigger time
        status: { type: String, enum: ["UNREAD", "SENT", "READ", "CANCELLED"], default: "UNREAD" },
    },
    { timestamps: true }
);

export const ReminderNotification =
    mongoose.models.ReminderNotification || mongoose.model("ReminderNotification", reminderNotificationSchema);
