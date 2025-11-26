import { Notification } from "@/models/Notification";
import { NotificationStatus } from "@/models/NotificationStatus";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
/**
 * Create a new notification and statuses for multiple users
 * and also insert into Firestore for realtime updates
 */
export async function createNotification(data: {
    notificationType?: string;
    title: string;
    descriptions?: string;
    docs?: { url: string }[];
    createdBy: string;
    userId?: string[]; // multiple users allowed
}) {
    try {

        const FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "notification_local" : "notifications";
        // Step 1: Create notification in MongoDB
        const notification = await Notification.create({
            notificationType: data.notificationType || "Other",
            title: data.title,
            descriptions: data.descriptions || "",
            docs: data.docs || [],
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        });

        // Step 2: Create NotificationStatus + Firestore docs for each user

        if (data?.userId && data.userId.length > 0) {

            const statusDocs = data.userId.map((uid) => ({
                notificationId: notification._id,
                userId: uid,
                isSeen: false,
            }));

            // Insert into MongoDB
            await NotificationStatus.insertMany(statusDocs);

            // Insert into Firestore
            const batch = data.userId.map((uid) =>
                addDoc(collection(db, FIREBASE_DATABASE_NAME), {
                    userId: uid,
                    notificationId: notification._id.toString(),
                    title: data.title,
                    timestamp: serverTimestamp(), // Use server timestamp
                    isSeen: false,
                    type: data.notificationType
                })
            );

            const reult = await Promise.all(batch);
        }

        return notification;
    } catch (error: any) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification");
    }
}
