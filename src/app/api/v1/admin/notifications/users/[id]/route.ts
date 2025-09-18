import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { NotificationStatus } from "@/models/NotificationStatus";

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

        // Only last 1 month notifications
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Get all notification statuses for this user
        const statuses = await NotificationStatus.find({
            userId: id,
            createdAt: { $gte: oneMonthAgo },
        })
            .populate("notificationId") // populate Notification data
            .sort({ createdAt: -1 });

        // Map response into desired format
        const notifications = statuses.map((status: any) => {
            const n = status.notificationId;
            return {
                id: status._id.toString(), // notification status id
                message: n?.title || "New Notification",
                type: n?.notificationType || "Other",
                read: status.isSeen,
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
