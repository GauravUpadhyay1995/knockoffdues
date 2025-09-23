import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from '@/config/mongo';
import { User } from "@/models/User";
import { createNotification } from "@/lib/createNotification";
import { Calender } from "@/models/Calender";
import dayjs from "dayjs";
//everyday at 12 AM
export async function GET() {
    try {
        await connectToDB();

        const todayMMDD = dayjs().format("MM-DD"); // e.g., "09-22"

        // Find users whose birthday is today
        const birthdayUsers = await User.find({
            isActive: true,       // ✅ Only active users
            isVerified: true,
            $expr: { $eq: [{ $substr: ["$dateOfBirth", 5, 5] }, todayMMDD] }
        });

        if (birthdayUsers.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: "No birthdays today" });
        }

        // Get all user IDs for attendees
        const allUsers = await User.find({ isActive: true,       // ✅ Only active users
            isVerified: true,}, "_id"); // just get IDs
        const allUserIds = allUsers.map(u => u._id.toString());

        const startOfDay = dayjs().startOf('day').toDate(); // 12:00 AM today
        const endOfDay = dayjs().endOf('day').toDate();     // 11:59:59 PM today
        await Promise.all(
            birthdayUsers.map(async (user) => {
                // 1️⃣ Create Birthday Notification
                await createNotification({
                    notificationType: "Birthday",
                    title: `Birthday Celebration: Congratulations to ${user.name}`,
                    descriptions: `We wish you a very Happy Birthday, ${user.name}! 🎉`,
                    docs: [],
                    createdBy: user._id,
                    userId: [] // all others
                });

                const newMeeting = new Calender({
                    title: `Birthday Celebration: Congratulations to ${user.name}`,
                    description: `We wish you a very Happy Birthday, ${user.name}! 🎉`,
                    start: startOfDay,
                    end: endOfDay,
                    creator: user._id,
                    attendees: allUserIds, // exclude birthday person
                    category: "Birthday",
                });

                await newMeeting.save();

            })
        );

        return NextResponse.json({ success: true, count: birthdayUsers.length });
    } catch (error) {
        console.error('Error creating birthday notifications or calendar entries:', error);
        return NextResponse.json({ error: 'Failed to create birthday entries' }, { status: 500 });
    }
}
