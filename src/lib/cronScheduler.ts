import cron from "node-cron";
import { GET as scheduleReminders } from "@/app/api/v1/admin/scheduler/reminders/route"; // adjust path
import dayjs from "dayjs";

// Schedule task at 12:05 AM daily
cron.schedule("45 14 * * *", async () => {
    console.log(`[${dayjs().format()}] Running monthly reminder rollover cron...`);
    try {
        const response = await scheduleReminders();
        console.log("Cron completed:", response);
    } catch (err) {
        console.error("Cron error:", err);
    }
});
