import mongoose, { Schema, Types } from 'mongoose';
const notificationStatusSchema = new Schema({
    notificationId: {
        type: Types.ObjectId,
        ref: 'Notification',
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },

    isSeen: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });
export const NotificationStatus = mongoose.models.NotificationStatus || mongoose.model('NotificationStatus', notificationStatusSchema);
