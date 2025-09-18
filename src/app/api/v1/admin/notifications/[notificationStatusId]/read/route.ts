import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { NotificationStatus } from "@/models/NotificationStatus";
import { markAsRead } from "@/lib/updateSingleNotification";
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { notificationStatusId: string } }
// ) {
//   try {
//     await connectToDB();
//     const { notificationStatusId } = params;

//     if (!notificationStatusId) {
//       return NextResponse.json(
//         { success: false, message: "NotificationStatusId is required" },
//         { status: 400 }
//       );
//     }

//     const updated = await NotificationStatus.findByIdAndUpdate(
//       notificationStatusId,
//       { isSeen: true },
//       { new: true }
//     );

//     if (!updated) {
//       return NextResponse.json(
//         { success: false, message: "Notification not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, data: updated });
//   } catch (error: any) {
//     console.error("Error marking notification as read:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to mark as read" },
//       { status: 500 }
//     );
//   }
// }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { notificationStatusId: string } }
) {
  try {
    await connectToDB();

    const updated = await markAsRead(params.notificationStatusId);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to mark as read" },
      { status: 500 }
    );
  }
}
