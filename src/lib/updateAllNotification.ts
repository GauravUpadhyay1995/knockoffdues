import { NotificationStatus } from "@/models/NotificationStatus";
import { db } from "./firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
        const FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "notification_local" : "notifications";

/**
 * Mark all notifications for a user as read (MongoDB + Firestore)
 */
export async function markAllAsRead(userId: string) {
  try {
    // Step 1: Update in MongoDB
    await NotificationStatus.updateMany(
      { userId, isSeen: false },
      { $set: { isSeen: true } }
    );

    // Step 2: Update in Firestore
    const q = query(collection(db, FIREBASE_DATABASE_NAME), where("userId", "==", userId));
    const snap = await getDocs(q);
    const updates = snap.docs.map((doc) => updateDoc(doc.ref, { isSeen: true }));
    await Promise.all(updates);

    return { success: true };
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    throw new Error("Failed to mark all notifications as read");
  }
}
