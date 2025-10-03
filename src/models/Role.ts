import mongoose, { Schema, Types } from 'mongoose';

const roleSchema = new Schema({
    role: {
        type: String,
        required: true,
        trim: true,
    },

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

export const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
