import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Calender } from "@/models/Calender";




// GET: Fetch all meetings
export async function GET() {
    try {
        const meetings = await Calender.find()
            .populate('creator', 'name') // Populate creator's name
            .populate('attendees', 'name') // Populate attendees' names
            .lean(); // Convert to plain JavaScript objects for performance
        return NextResponse.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }
}

// POST: Create a new meeting
export async function POST(request: Request) {
    try {
  
        const body = await request.json();

        // Input validation
        if (!body.title || !body.start || !body.end || !body.creator) {
            return NextResponse.json({ error: 'Missing required fields: title, start, end, creator' }, { status: 400 });
        }

        // Validate date fields
        const startDate = new Date(body.start);
        const endDate = new Date(body.end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }
        if (startDate >= endDate) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Validate creator and attendees
        if (!mongoose.Types.ObjectId.isValid(body.creator)) {
            return NextResponse.json({ error: 'Invalid creator ID' }, { status: 400 });
        }
        if (body.attendees && !body.attendees.every((id: string) => mongoose.Types.ObjectId.isValid(id))) {
            return NextResponse.json({ error: 'Invalid attendee ID(s)' }, { status: 400 });
        }

        // Validate category
        const validCategories = ['Task', 'Meeting', 'Birthday', 'Event', 'Followup', 'Other'];
        if (body.category && !validCategories.includes(body.category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const newMeeting = new Calender({
            title: body.title,
            description: body.description || '',
            start: startDate,
            end: endDate,
            creator: body.creator,
            attendees: body.attendees || [],
            category: body.category || 'Other',
        });

        const savedMeeting = await newMeeting.save();
        const populatedMeeting = await Calender.findById(savedMeeting._id)
            .populate('creator', 'name')
            .populate('attendees', 'name')
            .lean();

        return NextResponse.json(populatedMeeting, { status: 201 });
    } catch (error) {
        console.error('Error creating meeting:', error);
        return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }
}