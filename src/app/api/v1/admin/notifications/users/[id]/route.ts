import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { NotificationStatus } from "@/models/NotificationStatus";
import { Notification } from "@/models/Notification"; // This line is crucial!

// Define a type for the populated Notification document for better type safety
interface PopulatedNotificationStatus {
    _id: string;
    userId: string;
    isSeen: boolean;
    createdAt: Date;
    notificationId: {
        title: string;
        notificationType: string;
        descriptions: string;
        docs: string[];
    };
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDB();
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "id is required" },
                { status: 400 }
            );
        }

        // A more reliable way to get the date one month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        // Get all notification statuses for this user, sorted by creation date
        const statuses = await NotificationStatus.find({
            userId: id,
            createdAt: { $gte: oneMonthAgo },
        })
            .populate("notificationId")
            .sort({ createdAt: -1 })
            .lean(); // Use .lean() for faster query performance

        // Map the response into the desired format with a clear type
        const notifications = (statuses as PopulatedNotificationStatus[]).map((status) => {
            const n = status.notificationId;
            return {
                id: status._id.toString(),
                message: n?.title || "New Notification",
                type: n?.notificationType || "Other",
                read: status.isSeen, // Matches the front-end component's prop
                timestamp: status.createdAt?.toISOString(),
                descriptions: n?.descriptions || "",
                docs: n?.docs || [],
            };
        });

        return NextResponse.json({ success: true, data: notifications });
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}
