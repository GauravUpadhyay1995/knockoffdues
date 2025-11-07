// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/config/mongo";
import { Task } from "@/models/Task";
import { SubTask } from "@/models/SubTask";
import { User } from "@/models/User";
import { asyncHandler } from "@/lib/asyncHandler";

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

    // ✅ Populate assignedBy, createdBy, updatedBy and subTasks with sorting
    const task = await Task.findById(id)
      .populate("assignedBy", "name email emp_id")
      .populate("createdBy", "name email emp_id")
      .populate("updatedBy", "name email emp_id")
      .populate({
        path: "subTasks",
        model: SubTask,
        options: { 
          sort: { createdAt: -1 } // 🔥 NEW: Sort subtasks by createdAt descending (newest first)
        },
        populate: {
          path: "createdBy",
          model: User,
          select: "name email role emp_id",
        },
      });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // ✅ Fetch assigned users for assignedTo string[] field
    let assignedUsers: any[] = [];
    if (task.assignedTo && task.assignedTo.length > 0) {
      const validIds = task.assignedTo.filter((id: string) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      if (validIds.length > 0) {
        assignedUsers = await User.find(
          { _id: { $in: validIds } },
          "name email emp_id"
        );
      }
    }

    // ✅ Final response
    const responseData = {
      ...task.toObject(),
      assignedTo: assignedUsers, // Replace string IDs with user objects
    };

    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
  }
);