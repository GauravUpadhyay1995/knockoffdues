
import { CaseLower } from 'lucide-react';
import mongoose, { Schema, Types } from 'mongoose';

const departmentSchema = new Schema(
    {
        department: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,

        },
        isActive: {
            type: Boolean,
            default: true, // active by default
        },
    },
    { timestamps: true }
);

export const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

