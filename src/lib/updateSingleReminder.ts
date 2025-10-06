import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function markAsRead(notificationStatusId: string) {
  try {

    const ref = doc(db, "BillingReminder", notificationStatusId);
    await updateDoc(ref, { isSeen: true });
    return true;
  } catch (err) {
    console.error("Error marking reminder as read:", err);
    throw new Error("Failed to mark reminder as read");
  }
}
