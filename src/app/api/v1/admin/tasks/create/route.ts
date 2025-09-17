import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/config/mongo";
import { Task } from "@/models/Task";
import { asyncHandler } from "@/lib/asyncHandler";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { createNotification } from "@/lib/createNotification";
// Pre-compile ObjectId validation regex (faster than mongoose check)
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

// Pre-created response objects for common errors (reuse instances)
const RESPONSES = {
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
  )
};

// Cache for ObjectId instances to avoid repeated creation
const objectIdCache = new Map<string, mongoose.Types.ObjectId>();

const getCachedObjectId = (id: string): mongoose.Types.ObjectId => {
  if (!objectIdCache.has(id)) {
    objectIdCache.set(id, new mongoose.Types.ObjectId(id));
  }
  return objectIdCache.get(id)!;
};

// Pre-parse assignedTo data efficiently
const parseAssignedTo = (assignedToEntries: string[], rawBody: any): string[] => {
  const result: string[] = [];

  // Add entries from form data
  result.push(...assignedToEntries);

  // Process rawBody.assignedTo if present
  if (rawBody.assignedTo) {
    if (Array.isArray(rawBody.assignedTo)) {
      result.push(...rawBody.assignedTo);
    } else if (typeof rawBody.assignedTo === 'string') {
      // Fast check if it might be JSON (starts with [ and ends with ])
      if (rawBody.assignedTo.startsWith('[') && rawBody.assignedTo.endsWith(']')) {
        try {
          const parsed = JSON.parse(rawBody.assignedTo);
          if (Array.isArray(parsed)) {
            result.push(...parsed);
          }
        } catch {
          // If JSON parsing fails, fall back to comma separation
          result.push(...rawBody.assignedTo.split(','));
        }
      } else {
        // Direct comma-separated string
        result.push(...rawBody.assignedTo.split(','));
      }
    }
  }

  return result;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    const startTime = Date.now();

    try {
      // Start DB connection and form parsing in parallel
      const [formData] = await Promise.all([req.formData(), connectToDB()]);

      // Process form data in a single pass
      const rawBody: Record<string, any> = {};
      const files: File[] = [];
      const assignedToEntries: string[] = [];

      for (const [key, value] of formData.entries()) {
        if (key === "docs" && value instanceof File && value.size > 0) {
          files.push(value);
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
      const docs: { url: string }[] = [];

      if (files.length > 0) {
        // Process files in batches to avoid overwhelming the system
        for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
          const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);
          const batchPromises = batch.map(async (file) => {
            // Fast file type validation
            if (!ALLOWED_FILE_TYPES.has(file.type)) {
              throw new Error("INVALID_FILE_TYPE");
            }

            // Convert to buffer and upload
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadBufferToS3(buffer, file.type, file.name, "tasks");

            if (!uploadResult?.url) {
              throw new Error("UPLOAD_FAILED");
            }

            return { url: uploadResult.url };
          });

          // Wait for batch to complete
          const batchResults = await Promise.allSettled(batchPromises);

          // Process results
          for (const result of batchResults) {
            if (result.status === "fulfilled") {
              docs.push(result.value);
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

      // Prepare payload
      const user = (req as any).user;
      const payload: any = { ...rawBody, docs };
      let createdBy;
      let updatedBy;

      // Add user references efficiently
      if (user?.id && isValidObjectId(user.id)) {
        const userId = getCachedObjectId(user.id);
        payload.createdBy = createdBy = userId;
        payload.updatedBy = updatedBy = userId;
        payload.assignedBy = userId;
      }

      // Process assignedTo data
      const assignedToArray = parseAssignedTo(assignedToEntries, rawBody);

      // Filter and convert valid ObjectIds using caching
      payload.assignedTo = assignedToArray
        .map((id: string) => id.trim())
        .filter((id: string) => isValidObjectId(id))
        .map((id: string) => getCachedObjectId(id));

      // Create task with timeout protection
      const task = await Promise.race([
        Task.create(payload),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database timeout")), 10000)
        )
      ]) as any;

      assignedToArray.push(user.id); // Notify the creator as well
      await createNotification({
        notificationType: "Task",
        title: `New Task Assigned: ${task.taskName}`,
        descriptions: `You have been assigned to task: ${task.taskName}`,
        docs,
        createdBy: createdBy,
        userId: assignedToArray
      });
      return NextResponse.json(
        {
          success: true,
          message: "Task created successfully",
          data: task,
        },
        { status: 201 }
      );

    } catch (error) {
      console.error("API Error:", error);

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