import mongoose, { Schema, Types } from 'mongoose';
const notificationSchema = new Schema({
    notificationType: {
        type: String,
        enum: ['Task', 'Meeting', 'Birthday', 'Event', 'Followup', 'Other'],
        default: 'Other',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    descriptions: {
        type: String,
        required: false,
        trim: true,
    },
    docs: [
        {
            url: { type: String, required: true },

        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, { timestamps: true });
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
