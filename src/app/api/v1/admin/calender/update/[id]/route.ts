import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Calender } from "@/models/Calender";

// PUT: Update an existing meeting
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { id } = params;

        // Validate meeting ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid meeting ID' }, { status: 400 });
        }

        // Check if meeting exists
        const existingMeeting = await Calender.findById(id);
        if (!existingMeeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Input validation - required fields
        if (!body.title || !body.start || !body.end) {
            return NextResponse.json({ error: 'Missing required fields: title, start, end' }, { status: 400 });
        }

        // Validate date fields
        const startDate = new Date(body.start);
        const endDate = new Date(body.end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Prevent updating to past dates
        const now = new Date();
        if (startDate < now) {
            return NextResponse.json({ error: 'Cannot schedule events in the past' }, { status: 400 });
        }

        if (startDate >= endDate) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Validate creator and attendees
        if (!mongoose.Types.ObjectId.isValid(body.creator)) {
            return NextResponse.json({ error: 'Invalid creator ID' }, { status: 400 });
        }

        // Ensure creator has permission to update (security check)
        if (existingMeeting.creator.toString() !== body.creator) {
            return NextResponse.json({ error: 'Unauthorized: You can only update meetings you created' }, { status: 403 });
        }

        // Validate attendees
        if (body.attendees && (!Array.isArray(body.attendees) || !body.attendees.every((attendeeId: string) => mongoose.Types.ObjectId.isValid(attendeeId)))) {
            return NextResponse.json({ error: 'Invalid attendee ID(s)' }, { status: 400 });
        }

        // Validate category
        const validCategories = ['Task', 'Meeting', 'Birthday', 'Event', 'Followup', 'Other'];
        if (body.category && !validCategories.includes(body.category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        // Check for time conflicts with other meetings
        if (body.attendees && body.attendees.length > 0) {
            const conflictCheck = await Calender.find({
                $and: [
                    { _id: { $ne: id } }, // Exclude the current meeting
                    {
                        $or: [
                            { creator: { $in: [body.creator, ...body.attendees] } },
                            { attendees: { $in: [body.creator, ...body.attendees] } }
                        ]
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { start: { $lt: endDate } },
                                    { end: { $gt: startDate } }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (conflictCheck.length > 0) {
                const conflicts = conflictCheck.map(c => ({
                    title: c.title,
                    start: c.start,
                    end: c.end,
                    creator: c.creator,
                    attendees: c.attendees
                }));
                return NextResponse.json({
                    error: 'Time conflict detected',
                    conflicts
                }, { status: 409 });
            }
        }

        // Update the meeting
        const updatedMeeting = await Calender.findByIdAndUpdate(
            id,
            {
                title: body.title,
                description: body.description || '',
                start: startDate,
                end: endDate,
                creator: body.creator,
                attendees: body.attendees || [],
                category: body.category || 'Other',
                updatedAt: new Date() // Add timestamp for when it was last updated
            },
            {
                new: true, // Return the updated document
                runValidators: true // Run validation on update
            }
        );

        if (!updatedMeeting) {
            return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
        }

        // Populate the response
        const populatedMeeting = await Calender.findById(updatedMeeting._id)
            .populate('creator', 'name')
            .populate('attendees', 'name')
            .lean();

        return NextResponse.json(populatedMeeting, { status: 200 });

    } catch (error) {
        console.error('Error updating meeting:', error);
        return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }
}

// DELETE: Delete a meeting
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Validate meeting ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid meeting ID' }, { status: 400 });
        }

        // Check if meeting exists and get creator
        const existingMeeting = await Calender.findById(id).select('creator');
        if (!existingMeeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // You might want to add authentication here to verify the user is the creator
        // For now, we'll assume the request is authenticated and includes the user ID
        const authHeader = request.headers.get('authorization');
        // TODO: Extract user ID from auth token and compare with existingMeeting.creator

        // Delete the meeting
        const deletedMeeting = await Calender.findByIdAndDelete(id);

        if (!deletedMeeting) {
            return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Meeting deleted successfully',
            id: id
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting meeting:', error);
        return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
    }
}