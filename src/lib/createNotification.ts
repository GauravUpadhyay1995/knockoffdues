import { Notification } from "@/models/Notification";
import { NotificationStatus } from "@/models/NotificationStatus";

/**
 * Create a new notification
 * @param data - Notification data
 * @returns created notification document
 */
export async function createNotification(data: {
    notificationType?: string;
    title: string;
    descriptions?: string;
    docs?: { url: string }[];
    createdBy: string;
    updatedBy: string;
    userId?: string[];
}) {
    try {
        // create new notification
        console.log("Creating notification with data:", data);
        const notification = await Notification.create({
            notificationType: data.notificationType || "Other",
            title: data.title,
            descriptions: data.descriptions || "",
            docs: data.docs || [],
            createdBy: data.createdBy,
            updatedBy: data.updatedBy,
        });

        if (data?.userId && data?.userId?.length > 0) {
            // Create notification status for each user
            const notificationStatusPromises = data.userId.map(userId =>
                NotificationStatus.create({
                    notificationId: notification._id,
                    userId: userId,
                    isSeen: false,
                })
            );

            // Wait for all notification status documents to be created
            await Promise.all(notificationStatusPromises);
        }

        return notification;
    } catch (error: any) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification");
    }
}