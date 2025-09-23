import mongoose, { Schema, Types } from 'mongoose';

const taskSchema = new Schema({
    taskName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: String,
        required: true,
        trim: true,
    },
    endDate: {
        type: String,
        required: true,
        trim: true,
    },
    assignedTo: [{
        type: String,
        required: false,
    }],
    assignedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: false,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],

        default: 'Medium',
        required: true,
    },
    stage: {
        type: String,
        enum: ['Pending', 'InProgress', 'Completed'],
        default: 'Pending',
        required: true,
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
    subTasks: [{
        type: Types.ObjectId,
        ref: 'SubTask',
        required: false,

    }],
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
