// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/config/mongo";
import { Task } from "@/models/Task";
import { User } from "@/models/User"; // make sure you have User model
import { asyncHandler } from "@/lib/asyncHandler";

// Utility: validate MongoDB ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID" },
        { status: 400 }
      );
    }

    await connectToDB();

    // fetch task (with basic populate for single refs)
    const task = await Task.findById(id)
      .populate("assignedBy", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // manually fetch assigned users based on assignedTo (string[] of IDs)
    let assignedUsers: any[] = [];
    if (task.assignedTo && task.assignedTo.length > 0) {
      // filter valid ObjectIds only
      const validIds = task.assignedTo.filter((id: string) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      if (validIds.length > 0) {
        assignedUsers = await User.find(
          { _id: { $in: validIds } },
          "name email"
        );
      }
    }

    // merge into final response
    const responseData = {
      ...task.toObject(),
      assignedTo: assignedUsers, // replace array of strings with user objects
    };

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  }
);
