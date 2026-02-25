import mongoose from "mongoose";
import { Calender } from "@/models/Calender";
import { createNotification } from "@/lib/createNotification";

/**
 * Calculate next birthday date (date & month only)
 */
function getNextBirthdayDate(birthdate: string): Date {
    const [year, month, day] = birthdate.split("-").map(Number);

    const today = new Date();
    let birthday = new Date(
        today.getFullYear(),
        month - 1,   // JS months are 0-based
        day,
        0, 0, 0
    );

    if (birthday < today) {
        birthday = new Date(
            today.getFullYear() + 1,
            month - 1,
            day,
            0, 0, 0
        );
    }

    return birthday;
}


/**
 * Create birthday event directly
 */
export async function createBirthdayEvent({
    userId,
    birthdate,
    creatorId,
    title,
    description = "",
    notify = true
}: {
    userId: string;       // Whose birthday
    birthdate: string;    // yyyy-mm-dd
    creatorId: string;    // Admin/System
    title?: string;
    description?: string;
    notify?: boolean;
}) {
    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(creatorId)
    ) {
        throw new Error("Invalid user or creator ID");
    }

    const startDate = getNextBirthdayDate(birthdate);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59);
    const isBirthDateExists = await Calender.findOne({
        category: "Birthday", // or use regex if needed
        attendees: userId
    })
    if(isBirthDateExists){
        return "Birthdate already exists";
    }
    const birthdayEvent = await Calender.create({
        title: title || "🎂 Birthday",
        description,
        start: startDate,
        end: endDate,
        creator: creatorId,
        attendees: [userId],
        category: "Birthday"
    });

    // Fire & forget notification
    // if (notify) {
    //     createNotification({
    //         notificationType: "Birthday",
    //         title: `🎉 Birthday Reminder`,
    //         descriptions: `Today is your birthday! 🎂`,
    //         docs: [],
    //         createdBy: creatorId,
    //         userId: [userId]
    //     }).catch(console.error);
    // }

    return birthdayEvent;
}


export async function deleteBirthdayEventByUserId(userId: string) {
    console.log("USERID",userId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const result = await Calender.deleteMany({
        category: "Birthday", // or use regex if needed
        attendees: objectUserId
    });

    return {
        deletedCount: result.deletedCount ?? 0
    };
}
