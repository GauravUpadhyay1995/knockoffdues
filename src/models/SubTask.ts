import mongoose, { Schema, Types } from 'mongoose';

const subTaskSchema = new Schema({

    description: {
        type: String,
        required: true,
        trim: true,
    },
    docs: [
        {
            url: { type: String, required: true },

        },
    ],
    
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },

}, { timestamps: true });

export const SubTask = mongoose.models.SubTask || mongoose.model('SubTask', subTaskSchema);
