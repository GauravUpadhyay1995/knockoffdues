import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/config/mongo";
import { Task } from "@/models/Task";
import { asyncHandler } from "@/lib/asyncHandler";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { uploadBufferToS3 } from '@/lib/uploadToS3';

// Pre-compile ObjectId validation regex
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const isValidObjectId = (id: string): boolean => objectIdRegex.test(id);

// Pre-defined Set for O(1) file type lookups
const ALLOWED_FILE_TYPES = new Set([
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

// Pre-created response objects for common errors
const RESPONSES = {
    TASK_NOT_FOUND: NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
    ),
    INVALID_FILE_TYPE: NextResponse.json(
        { success: false, message: "Only images, PDFs, Word, and Excel files are allowed" },
        { status: 400 }
    ),
    UPLOAD_FAILED: NextResponse.json(
        { success: false, message: "Failed to upload file to S3" },
        { status: 500 }
    ),
    DB_ERROR: NextResponse.json(
        { success: false, message: "Database error" },
        { status: 500 }
    ),
    INVALID_ID: NextResponse.json(
        { success: false, message: "Invalid task ID" },
        { status: 400 }
    )
};

// Cache for ObjectId instances
const objectIdCache = new Map<string, mongoose.Types.ObjectId>();

const getCachedObjectId = (id: string): mongoose.Types.ObjectId => {
    if (!objectIdCache.has(id)) {
        objectIdCache.set(id, new mongoose.Types.ObjectId(id));
    }
    return objectIdCache.get(id)!;
};

// Parse assignedTo data efficiently
const parseAssignedTo = (assignedToEntries: string[], rawBody: any): string[] => {
    const result: string[] = [];

    // Add entries from form data
    result.push(...assignedToEntries);

    // Process rawBody.assignedTo if present
    if (rawBody.assignedTo) {
        if (Array.isArray(rawBody.assignedTo)) {
            result.push(...rawBody.assignedTo);
        } else if (typeof rawBody.assignedTo === 'string') {
            // Fast check if it might be JSON
            if (rawBody.assignedTo.startsWith('[') && rawBody.assignedTo.endsWith(']')) {
                try {
                    const parsed = JSON.parse(rawBody.assignedTo);
                    if (Array.isArray(parsed)) {
                        result.push(...parsed);
                    }
                } catch {
                    result.push(...rawBody.assignedTo.split(','));
                }
            } else {
                result.push(...rawBody.assignedTo.split(','));
            }
        }
    }

    return result;
};

export const PUT = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        const startTime = Date.now();
        const taskId = params.id;

        // Validate task ID
        if (!taskId || !isValidObjectId(taskId)) {
            return RESPONSES.INVALID_ID;
        }

        try {
            // Start DB connection and form parsing in parallel
            const [formData] = await Promise.all([req.formData(), connectToDB()]);

            // Check if task exists
            const existingTask = await Task.findById(taskId);
            if (!existingTask) {
                return RESPONSES.TASK_NOT_FOUND;
            }

            // Process form data in a single pass
            const rawBody: Record<string, any> = {};
            const files: File[] = [];
            const assignedToEntries: string[] = [];
            const docsToRemove: string[] = [];

            for (const [key, value] of formData.entries()) {
                if (key === "docs" && value instanceof File && value.size > 0) {
                    files.push(value);
                } else if (key === "removeDocs" && typeof value === 'string') {
                    // Handle documents to remove
                    docsToRemove.push(...value.split(','));
                } else if (key.startsWith("assignedTo")) {
                    assignedToEntries.push(value.toString());
                } else if (value instanceof File) {
                    // Skip other files that aren't "docs"
                    continue;
                } else {
                    rawBody[key] = value;
                }
            }

            // Process file uploads in parallel with concurrency limit
            const MAX_CONCURRENT_UPLOADS = 3;
            const newDocs: { url: string }[] = [];

            if (files.length > 0) {
                for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
                    const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);
                    const batchPromises = batch.map(async (file) => {
                        // Fast file type validation
                        if (!ALLOWED_FILE_TYPES.has(file.type)) {
                            throw new Error("INVALID_FILE_TYPE");
                        }

                        const buffer = Buffer.from(await file.arrayBuffer());
                        const uploadResult = await uploadBufferToS3(buffer, file.type, file.name, "tasks");

                        if (!uploadResult?.url) {
                            throw new Error("UPLOAD_FAILED");
                        }

                        return { url: uploadResult.url };
                    });

                    const batchResults = await Promise.allSettled(batchPromises);

                    for (const result of batchResults) {
                        if (result.status === "fulfilled") {
                            newDocs.push(result.value);
                        } else {
                            if (result.reason.message === "INVALID_FILE_TYPE") {
                                return RESPONSES.INVALID_FILE_TYPE;
                            } else {
                                return RESPONSES.UPLOAD_FAILED;
                            }
                        }
                    }
                }
            }

            // Prepare update payload
            const user = (req as any).user;
            const updateData: any = { ...rawBody };

            // Add updatedBy reference
            if (user?.id && isValidObjectId(user.id)) {
                updateData.updatedBy = getCachedObjectId(user.id);
            }

            // Process assignedTo data if provided
            if (assignedToEntries.length > 0 || rawBody.assignedTo) {
                const assignedToArray = parseAssignedTo(assignedToEntries, rawBody);
                updateData.assignedTo = assignedToArray
                    .map((id: string) => id.trim())
                    .filter((id: string) => isValidObjectId(id))
                    .map((id: string) => getCachedObjectId(id));
            }

            // Handle documents - combine existing docs (minus removed) with new docs
            if (newDocs.length > 0 || docsToRemove.length > 0) {
                const existingDocs = existingTask.docs || [];

                // Filter out removed documents
                const filteredDocs = existingDocs.filter((doc: any) =>
                    !docsToRemove.includes(doc.url) && !docsToRemove.includes(doc._id?.toString())
                );

                // Add new documents
                updateData.docs = [...filteredDocs, ...newDocs];
            }

            // Update task with timeout protection
            const updatedTask = await Promise.race([
                Task.findByIdAndUpdate(
                    taskId,
                    { $set: updateData },
                    { new: true, runValidators: true }
                ),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Database timeout")), 10000)
                )
            ]);

            // Log performance
            const endTime = Date.now();

            return NextResponse.json(
                {
                    success: true,
                    message: "Task updated successfully",
                    data: updatedTask,
                },
                { status: 200 }
            );

        } catch (error) {
            console.error("Update Task Error:", error);

            if (error instanceof Error && error.message === "Database timeout") {
                return NextResponse.json(
                    { success: false, message: "Database operation timed out" },
                    { status: 504 }
                );
            }

            return RESPONSES.DB_ERROR;
        }
    })
);

// PATCH endpoint for partial updates
export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        const startTime = Date.now();
        const taskId = params.id;


        // Validate task ID
        if (!taskId || !isValidObjectId(taskId)) {
            return RESPONSES.INVALID_ID;
        }

        try {
            // Connect to DB
            await connectToDB();

            // Check if task exists
            const existingTask = await Task.findById(taskId);
            if (!existingTask) {
                return RESPONSES.TASK_NOT_FOUND;
            }

            // Parse JSON body for PATCH requests
            const updateData = await req.json();
            const user = (req as any).user;

            // Add updatedBy reference
            if (user?.id && isValidObjectId(user.id)) {
                updateData.updatedBy = getCachedObjectId(user.id);
            }

            // Update task
            const updatedTask = await Promise.race([
                Task.findByIdAndUpdate(
                    taskId,
                    { $set: updateData },
                    { new: true, runValidators: true }
                ),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Database timeout")), 10000)
                )
            ]);

            // Log performance
            const endTime = Date.now();

            return NextResponse.json(
                {
                    success: true,
                    message: "Task updated successfully",
                    data: updatedTask,
                },
                { status: 200 }
            );

        } catch (error) {
            console.error("Patch Task Error:", error);

            if (error instanceof Error && error.message === "Database timeout") {
                return NextResponse.json(
                    { success: false, message: "Database operation timed out" },
                    { status: 504 }
                );
            }

            return RESPONSES.DB_ERROR;
        }
    })
);