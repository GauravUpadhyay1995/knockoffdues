import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from '@/config/mongo';
import { Reminder } from "@/models/Reminder";
import { Notification } from "@/models/Notification";
import { NotificationStatus } from "@/models/NotificationStatus";
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import dayjs from "dayjs";

// Everyday at 12 AM
export async function GET() {
    try {
        await connectToDB(); // Added: Connect to database

        const today = dayjs().startOf("day");
        const yesterday = today.subtract(1, "day");
        const startOfDay = yesterday.startOf("day");
        const endOfDay = yesterday.endOf("day");

        const reminders = await Reminder.find({
            billingDate: {
                $gte: startOfDay.toDate(),
                $lte: endOfDay.toDate(),
            },
            // paymentStatus: { $ne: "PAID" },
        });

        for (const r of reminders) {
            // Move billing date to same day next month
            const newBillingDate = dayjs(r.billingDate).add(1, "month").toDate();
            r.billingDate = newBillingDate;
            r.paymentStatus = "PENDING";
            r.notificationCreated = false; // Changed: Reset to false for new month
            const newReminder = await r.save();
            await scheduleCurrentMonthReminders([newReminder]);
        }

        await scheduleCurrentMonthReminders([]);

        return NextResponse.json({ success: true, message: "Monthly reminder rollover completed" });
    } catch (err) {
        console.error("Error in monthly reminder rollover:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

async function scheduleCurrentMonthReminders(reminders: any[]) {
    try {
        await connectToDB();

        const now = dayjs();
        const startOfCurrentMonth = now.startOf("month");
        const endOfNextMonth = now.add(1, "month").endOf("month");

        let rem: any[] = [];

        if (reminders.length > 0) {
            rem = reminders;
            for (const reminder of reminders) {
                reminder.paymentStatus = "PENDING";
                reminder.notificationCreated = false;
                await reminder.save();
            }
        } else {
            // Only reminders for current or next month
            rem = await Reminder.find({
                billingDate: {
                    $gte: startOfCurrentMonth.toDate(),
                    $lte: endOfNextMonth.toDate()
                },
                paymentStatus: { $ne: "PAID" },
                // notificationCreated: { $ne: true },
            });

            console.log("Reminders for current/next month:", rem);
        }

        for (const reminder of rem) {
            let notificationTitle = "";
            let notificationDescription = "";
            let reminderDate: Date;

            if (reminder.reminderType === "BEFORE_DAYS") {
                // Calculate initial reminder date based on beforeDays
                const beforeDays = reminder.beforeDays || 0;
                reminderDate = dayjs(reminder.billingDate)
                    .subtract(beforeDays, "day")
                    .hour(Number(reminder.timeOfDay.split(":")[0]))
                    .minute(Number(reminder.timeOfDay.split(":")[1]))
                    .toDate();

                // Ensure reminderDate is not in the past
                while (dayjs(reminderDate).isBefore(now)) {
                    reminderDate = dayjs(reminderDate).add(1, "day").toDate();
                }

                notificationTitle = `Upcoming Payment Reminder - ${reminder.vendorName}`;
                notificationDescription = `Payment of ${reminder.amount} for ${reminder.vendorName} is due on ${dayjs(reminder.billingDate).format('MMM DD, YYYY')}`;

            } else if (reminder.reminderType === "WEEKLY") {
                // Next Monday
                let nextMonday = dayjs().day(1);
                if (nextMonday.isBefore(now)) nextMonday = nextMonday.add(1, "week");

                reminderDate = nextMonday
                    .hour(Number(reminder.timeOfDay.split(":")[0]))
                    .minute(Number(reminder.timeOfDay.split(":")[1]))
                    .toDate();

                notificationTitle = `Weekly Payment Reminder - ${reminder.vendorName}`;
                notificationDescription = `Weekly payment reminder for ${reminder.vendorName} - Amount: ${reminder.amount}`;

                // Ensure reminderDate is not in the past
                while (dayjs(reminderDate).isBefore(now)) {
                    reminderDate = dayjs(reminderDate).add(1, "week").toDate();
                }
            }

            // Create notification
            await createNotification({
                title: notificationTitle,
                description: notificationDescription,
                reminderTime: reminderDate.toISOString(),
                vendorName: reminder.vendorName,
                amount: reminder.amount,
                billingDate: reminder.billingDate,
            });

            // Mark reminder as processed
            reminder.notificationCreated = true;
            await reminder.save();

            console.log(`Scheduled ${reminder.reminderType} reminder for ${reminder.vendorName} at`, reminderDate);
        }
    } catch (err) {
        console.error("Error in scheduleCurrentMonthReminders:", err);
    }
}



async function createNotification(data: {
    amount?: string;
    billingDate: string;
    title?: string;
    description?: string;
    reminderTime?: string;
    vendorName: string;

}) {
    try {
        // Step 2: Create NotificationStatus + Firestore docs for each user
        const result = await addDoc(collection(db, "BillingReminder"), {
            amount: data.amount,
            billingDate: Timestamp.fromDate(new Date(data.billingDate)),
            description: data.description || "",
            isSeen: false,
            reminderTime: Timestamp.fromDate(new Date(data.reminderTime)),
            title: data.title,
            vendorName: data.vendorName,


        })
        return result;
    } catch (error: any) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification");
    }
}