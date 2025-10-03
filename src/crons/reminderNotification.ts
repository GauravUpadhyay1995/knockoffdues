import cron from "node-cron";
import dayjs from "dayjs";
import { Reminder } from "@/models/Reminder";
import { Notification } from "@/models/Notification";

// Run daily at 00:05
cron.schedule("5 0 * * *", async () => {
  try {
    const today = dayjs().startOf("day");

    // Find reminders where billingDate is today
    const reminders = await Reminder.find({
      billingDate: { $lte: today.toDate() },
    });

    for (const r of reminders) {
      // Move billing date to same day next month
      const newBillingDate = dayjs(r.billingDate).add(1, "month").toDate();

      // Reset payment status
      r.billingDate = newBillingDate;
      r.paymentStatus = "PENDING";

      await r.save();
      // Pre-schedule new notifications for the new billing cycle
      const notificationsToCreate: any[] = [];
      let startDate: any;
      const endDate = dayjs(r.billingDate);

      switch (r.reminderType) {
        case "BEFORE_DAYS":
          startDate = dayjs(r.billingDate).subtract(r.beforeDays, "day");
          break;
        case "EVERYDAY":
          startDate = dayjs(r.createdAt);
          break;
        case "WEEKLY":
          startDate = dayjs(r.createdAt);
          break;
        default:
          startDate = dayjs(r.createdAt);
      }


    }
  } catch (err) {
    console.error("Error in monthly reminder rollover:", err);
  }
});
