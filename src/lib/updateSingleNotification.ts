import { NotificationStatus } from "@/models/NotificationStatus";
import { db } from "./firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
        const FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "notification_local" : "notifications";


/**
 * Mark a single notification as read (MongoDB + Firestore)
 */
export async function markAsRead(notificationStatusId: string) {
  try {
    console.log("notificationStatusId", notificationStatusId)
    // Step 1: Update in MongoDB
    const updated = await NotificationStatus.findOneAndUpdate(
      { notificationId: notificationStatusId }, // filter by custom field
      { isSeen: true },                          // fields to update
      { new: true }                              // return the updated document
    );
    if (!updated) {
      throw new Error("Notification status not found");
    }

    // Step 2: Update in Firestore
    // We stored `notificationId` + `userId` in Firestore
    const q = query(
      collection(db, FIREBASE_DATABASE_NAME),
      where("notificationId", "==", updated.notificationId.toString()),
      where("userId", "==", updated.userId.toString())
    );

    const snap = await getDocs(q);
    const updates = snap.docs.map((doc) =>
      updateDoc(doc.ref, { isSeen: true })
    );
    await Promise.all(updates);

    return updated;
  } catch (err) {
    console.error("Error marking notification as read:", err);
    throw new Error("Failed to mark notification as read");
  }
}
