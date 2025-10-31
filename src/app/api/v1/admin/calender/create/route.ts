import { NextRequest, NextResponse } from "next/server";
import mongoose from 'mongoose';
import { Calender } from "@/models/Calender";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { asyncHandler } from "@/lib/asyncHandler";
import { createNotification } from "@/lib/createNotification";

// GET: Fetch all meetings
export async function GET() {
    try {
        const meetings = await Calender.find()
            .populate('creator', 'name')
            .populate('attendees', 'name')
            .lean();
        return NextResponse.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }
}

// POST: Create a new meeting
export const POST = verifyAdmin(
    asyncHandler(async (request: NextRequest) => {
        try {
            const user = (request as any).user;
            const body = await request.json();

            // Validate required fields
            if (!body.title || !body.start || !body.end || !body.creator) {
                return NextResponse.json({ error: 'Missing required fields: title, start, end, creator' }, { status: 400 });
            }

            // Validate date fields
            const startDate = new Date(body.start);
            const endDate = new Date(body.end);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
                return NextResponse.json({ error: 'Invalid date or end date is not after start date' }, { status: 400 });
            }

            // Validate IDs and category using a single-pass approach
            if (!mongoose.Types.ObjectId.isValid(body.creator) ||
                (body.attendees && !body.attendees.every((id: string) => mongoose.Types.ObjectId.isValid(id)))) {
                return NextResponse.json({ error: 'Invalid creator or attendee ID(s)' }, { status: 400 });
            }
            const validCategories = ['Task', 'Meeting', 'Birthday', 'Event', 'Followup', 'Other'];
            if (body.category && !validCategories.includes(body.category)) {
                return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
            }

            // Create the meeting document
            const newMeeting = {
                title: body.title,
                description: body.description || '',
                start: startDate,
                end: endDate,
                creator: body.creator,
                attendees: body.attendees || [],
                category: body.category || 'Other',
            };

            const savedMeeting = await Calender.create(newMeeting);

            // Trigger notification and respond in parallel
            const notificationPromise = createNotification({
                notificationType: body.category,
                title: `New reminder: ${body.category}: ${body.title}`,
                descriptions: `You have a new reminder for ${body.category}: ${body.description}`,
                docs: [],
                createdBy: user.id,
                userId: body.attendees || []
            });

            // Populate the saved meeting document in-memory to avoid an extra DB call
            const populatedMeeting = {
                ...savedMeeting.toObject(),
                creator: { _id: savedMeeting.creator, name: user.name },
                attendees: body.attendees || [] // Attendees are not populated here as we don't have their names readily
            };

            // Don't await the notification promise to make the response faster
            notificationPromise.catch(err => console.error("Error creating notification:", err));

            return NextResponse.json(populatedMeeting, { status: 201 });

        } catch (error) {
            console.error('Error creating meeting:', error);
            return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
        }
    })
);