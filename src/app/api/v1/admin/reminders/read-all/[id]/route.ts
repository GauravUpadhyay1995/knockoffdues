import { NextRequest, NextResponse } from "next/server";
import { markAsRead } from "@/lib/updateSingleReminder";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await markAsRead(params.id);

    return NextResponse.json({
      success: true,
      message: "Reminder marked as read",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to mark as read" },
      { status: 500 }
    );
  }
}
