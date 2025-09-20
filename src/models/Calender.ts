import mongoose, { Schema, Types } from 'mongoose';
const calenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    category: {
        type: String,
        enum: ['Task', 'Meeting', 'Birthday', 'Event', 'Followup', 'Other'],
        default: 'Other',
    },
    color: {
        type: String, // Optional, can be used to store a hex code for UI color
    }
});
export const Calender = mongoose.models.Calender || mongoose.model('Calender', calenderSchema);

