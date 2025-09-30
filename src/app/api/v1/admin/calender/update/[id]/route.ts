import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Calender } from "@/models/Calender";
import { asyncHandler } from '@/lib/asyncHandler';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { sendResponse } from '@/lib/sendResponse';

// Utility function for validation
const validateMeetingData = (body: any) => {
    const { title, start, end, creator, attendees, category } = body;

    if (!title || !start || !end || !creator) {
        return 'Missing required fields: title, start, end, creator';
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
        return 'Invalid date or end date is not after start date';
    }

    const now = new Date();
    if (startDate < now) {
        return 'Cannot schedule events in the past';
    }

    if (!mongoose.Types.ObjectId.isValid(creator)) {
        return 'Invalid creator ID';
    }

    if (attendees && (!Array.isArray(attendees) || !attendees.every((id: string) => mongoose.Types.ObjectId.isValid(id)))) {
        return 'Invalid attendee ID(s)';
    }

    const validCategories = ['Task', 'Meeting', 'Birthday', 'Event', 'Followup', 'Other'];
    if (category && !validCategories.includes(category)) {
        return 'Invalid category';
    }

    return null; // Return null if validation passes
};

// PUT: Update an existing meeting
export const PUT = verifyAdmin(
    asyncHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
        const { id } = params;
        const body = await request.json();
        const user = (request as any).user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse({ success: false, statusCode: 400, message: 'Invalid meeting ID' });
        }

        const validationError = validateMeetingData(body);
        if (validationError) {
            return sendResponse({ success: false, statusCode: 400, message: validationError });
        }

        const { creator, attendees, start, end } = body;

        // Optimized single query to find and check ownership
        const existingMeeting = await Calender.findOne({ _id: id, creator: user.id }).select('creator');
        if (!existingMeeting) {
            return sendResponse({ success: false, statusCode: 404, message: 'Meeting not found or you do not have permission to update it' });
        }

        // Time conflict check (can be optimized with a single query)
        const conflictCheck = await Calender.find({
            _id: { $ne: id },
            $and: [
                {
                    $or: [
                        { creator: { $in: [...(attendees || []), creator] } },
                        { attendees: { $in: [...(attendees || []), creator] } }
                    ]
                },
                {
                    $and: [{ start: { $lt: end } }, { end: { $gt: start } }]
                }
            ]
        });

        if (conflictCheck.length > 0) {
            return sendResponse({
                success: false,
                statusCode: 409,
                message: 'Time conflict detected with another meeting',
                data: conflictCheck
            });
        }

        const updatedMeeting = await Calender.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .populate('creator', 'name')
            .populate('attendees', 'name')
            .lean();

        if (!updatedMeeting) {
            return sendResponse({ success: false, statusCode: 500, message: 'Failed to update meeting' });
        }

        return sendResponse({ success: true, statusCode: 200, message: 'Meeting updated successfully', data: updatedMeeting });
    })
);

// DELETE: Delete a meeting
export const DELETE = verifyAdmin(
    asyncHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
        const { id } = params;
        const user = (request as any).user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse({ success: false, statusCode: 400, message: 'Invalid meeting ID' });
        }

        // Optimized single query to find and delete, ensuring ownership
        const deletedMeeting = await Calender.findOneAndDelete({ _id: id, creator: user.id });

        if (!deletedMeeting) {
            return sendResponse({ success: false, statusCode: 404, message: 'Meeting not found or you do not have permission to delete it' });
        }

        return sendResponse({ success: true, statusCode: 200, message: 'Meeting deleted successfully' });
    })
);