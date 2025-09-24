import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/config/mongo";
import { Task } from "@/models/Task";
import { SubTask } from "@/models/SubTask";
import { asyncHandler } from "@/lib/asyncHandler";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { uploadBufferToS3 } from "@/lib/uploadToS3";
import { createNotification } from "@/lib/createNotification";


const ALLOWED_FILE_TYPES = new Set([
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
    "application/pdf"
]);

export const POST = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { taskId: string } }) => {
        await connectToDB();
        const { taskId } = params;
        const admin = (req as any).user;

        // ✅ Validate Task ID
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return NextResponse.json({ success: false, message: "Invalid Task ID" }, { status: 400 });
        }

        // ✅ Find Task
        const task = await Task.findById(taskId).populate("createdBy", "name email");
        if (!task) {
            return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
        }

        // ✅ Parse Form Data
        const formData = await req.formData();
        const description = String(formData.get("description") || "").trim();
        const files = formData.getAll("docs") as File[];

        const uploadedDocs: { url: string }[] = [];

        // ✅ Upload Files to S3
        for (const file of files) {
            if (!(file instanceof File) || file.size === 0) continue;

            if (!ALLOWED_FILE_TYPES.has(file.type)) {
                return NextResponse.json(
                    { success: false, message: `Invalid file type: ${file.name}` },
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadRes = await uploadBufferToS3(buffer, file.type, file.name, "subtasks");

            if (!uploadRes?.url) {
                return NextResponse.json(
                    { success: false, message: `Failed to upload ${file.name}` },
                    { status: 500 }
                );
            }

            uploadedDocs.push({ url: uploadRes.url });
        }

        // ✅ Create a New SubTask Document
        const subTask = new SubTask({
            task: task._id,        // reference to parent task
            description,
            docs: uploadedDocs,
            createdBy: admin.id,
        });

        await subTask.save();

        // ✅ (Optional) Push SubTask reference into Task
        task.subTasks.push(subTask._id);
        await task.save();

        if (!task.assignedTo.includes(String(task.createdBy._id))) {
            task.assignedTo.push(task.createdBy._id);
        }
        task.assignedTo = task.assignedTo.filter(
            (userId: any) => String(userId) !== String(admin.id)
        )

        await createNotification({
            notificationType: "Task",
            title: `<a href="/admin/tasks/${task._id}" class="mr-2 inline-flex items-center gap-2 px-3 py-1.5             rounded-lg text-xs font-medium              bg-green-100 text-green-700              hover:bg-green-200 hover:scale-105 hover:shadow-md             transition-all duration-300 ease-out" >${admin.name}</a> has commented on task: <a href="/admin/tasks/${task._id}" class="mr-2 inline-flex items-center gap-2 px-3 py-1.5             rounded-lg text-xs font-medium              bg-green-100 text-green-700              hover:bg-green-200 hover:scale-105 hover:shadow-md             transition-all duration-300 ease-out" >${task.taskName}</a>`,
            descriptions: `comment- ${description}`,
            docs: uploadedDocs,
            createdBy: admin.id,
            userId: task.assignedTo
        });




        return NextResponse.json({
            success: true,
            message: "Subtask created successfully",
            data: subTask,
        });
    })
);
