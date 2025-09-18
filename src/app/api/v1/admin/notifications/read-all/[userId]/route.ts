import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { markAllAsRead } from "@/lib/updateAllNotification";



export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectToDB();

    await markAllAsRead(params.userId);

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to mark all as read" },
      { status: 500 }
    );
  }
}

