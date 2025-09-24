import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { User } from '@/models/User';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { createNotification } from "@/lib/createNotification";

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    let userId = params.id;
    const admin = (req as any).user;

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
    }

    const hrData = await User.findOne({ role: "hr" }).lean();
    console.log("hrData", hrData);

    const existing = await User.findById(userId).lean();
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const updateFields: any = {};
    const rawNested: Record<string, any[]> = {
      academics: [],
      documents: [],
      workExperience: []
    };
    const fileUploads: { key: string; file: File }[] = [];

    // Track which arrays are being updated
    const updatedArrays: Set<string> = new Set();

    // ---- Parse form data in a single pass ----
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) fileUploads.push({ key, file: value });
        continue;
      }

      // Detect nested array pattern: e.g. academics[0][field]
      const match = key.match(/^(\w+)\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const [, group, idxStr, field] = match;
        const idx = Number(idxStr);
        rawNested[group] ??= [];
        rawNested[group][idx] ??= {};
        rawNested[group][idx][field] = value;
        updatedArrays.add(group);
      } else {
        updateFields[key] = value;
      }
    }

    // ---- Upload files concurrently ----
    const uploadedFiles = await Promise.all(
      fileUploads.map(async ({ key, file }) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const bucket = key.split('[')[0]; // academics/documents/avatar/...
        const uploaded = await uploadBufferToS3(buffer, file.type, file.name, bucket);
        return { key, url: uploaded?.url || null };
      })
    );

    // Map file URLs into nested data
    for (const { key, url } of uploadedFiles) {
      if (!url) continue;
      const match = key.match(/^(\w+)\[(\d+)\]/);
      if (match) {
        const [, group, idxStr] = match;
        const idx = Number(idxStr);
        rawNested[group] ??= [];
        rawNested[group][idx] ??= {};
        rawNested[group][idx].documentUrl = url;
        updatedArrays.add(group);
      } else if (key === 'avatar') {
        updateFields.avatar = url;
      }
    }

    // ---- NEW: Handle array updates with removal support and tracking ----
    const mergeNestedWithRemoval = (
      group: string,
      oldArr: any[],
      newArr: any[],
      boolFields: string[] = []
    ) => {
      // If this array wasn't updated in the form data, keep the existing array
      if (!updatedArrays.has(group)) {
        return { array: oldArr, deletedItems: [] };
      }

      // If array was updated but no items were sent, return empty array (all items removed)
      if (!newArr || newArr.length === 0) {
        return { array: [], deletedItems: oldArr }; // All items were deleted
      }

      // Track deleted items by comparing old and new arrays
      const deletedItems = oldArr.filter((oldItem, oldIndex) => {
        // An item is considered deleted if it existed in old array but not in new array
        // We'll check if there's a corresponding item in the new array at the same position
        // or if the item's unique identifier (like documentName/className) doesn't exist in new array
        return !newArr.some((newItem, newIndex) => {
          // Try to match by index first (simplest approach)
          if (newIndex === oldIndex) return true;

          // If that doesn't work, try to match by unique identifier
          if (oldItem.documentName && newItem.documentName) {
            return oldItem.documentName === newItem.documentName;
          }
          if (oldItem.className && newItem.className) {
            return oldItem.className === newItem.className;
          }

          return false;
        });
      });

      // Process the new array items
      const processedArray = newArr.map((newItem, index) => {
        const merged = { ...newItem };

        // Handle boolean fields
        boolFields.forEach(f => {
          if (newItem[f] !== undefined) {
            merged[f] = String(newItem[f]) === 'true';
          }
        });

        return merged;
      });

      return { array: processedArray, deletedItems };
    };

    // Apply the new merging logic for each array type and track deletions
    const academicsResult = mergeNestedWithRemoval(
      'academics',
      existing.academics || [],
      rawNested.academics || [],
      ['isRegular']
    );
    updateFields.academics = academicsResult.array;
    const deletedAcademics = academicsResult.deletedItems;

    const documentsResult = mergeNestedWithRemoval(
      'documents',
      existing.documents || [],
      rawNested.documents || [],
      []
    );
    updateFields.documents = documentsResult.array;
    const deletedDocuments = documentsResult.deletedItems;

    const workExperienceResult = mergeNestedWithRemoval(
      'workExperience',
      existing.workExperience || [],
      rawNested.workExperience || [],
      []
    );
    updateFields.workExperience = workExperienceResult.array;
    const deletedWorkExperiences = workExperienceResult.deletedItems;

    // ---- Single DB update ----
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    let profileName ="your" ;
    if (admin.role !== "hr" && admin.role !== "super admin") {
      userId = hrData?._id.toString() || userId;
      profileName = admin.name;
    }


    // ---- Notification logic ----
    const notificationPromises = [];

    // Notifications for DELETED documents
    if (deletedDocuments.length > 0) {
      deletedDocuments.forEach((deletedDoc) => {
        const title = "Document Deleted";
        const descriptions = `Document '${deletedDoc?.documentName}' has been removed from ${profileName} profile`;

        notificationPromises.push(
          createNotification({
            notificationType: "Other",
            title: title,
            descriptions: descriptions,
            docs: [],
            createdBy: admin.id,
            userId: [userId],
          })
        );
      });
    }

    // Notifications for DELETED academic records
    if (deletedAcademics.length > 0) {
      deletedAcademics.forEach((deletedAcademic) => {
        const title = "Academic Record Deleted";
        const descriptions = `Academic record for '${deletedAcademic?.className}' has been removed from ${profileName} profile`;

        notificationPromises.push(
          createNotification({
            notificationType: "Other",
            title: title,
            descriptions: descriptions,
            docs: [],
            createdBy: admin.id,
            userId: [userId],
          })
        );
      });
    }

    // Notifications for DELETED work experiences
    if (deletedWorkExperiences.length > 0) {
      deletedWorkExperiences.forEach((deletedExp) => {
        const title = "Work Experience Deleted";
        const descriptions = `Work experience at '${deletedExp?.companyName}' as '${deletedExp?.designation}' has been removed from ${profileName} profile`;

        notificationPromises.push(
          createNotification({
            notificationType: "Other",
            title: title,
            descriptions: descriptions,
            docs: [],
            createdBy: admin.id,
            userId: [userId],
          })
        );
      });
    }

    // Notifications for UPDATED documents (status changes and new additions)
    if (updateFields?.documents.length > 0) {
      updateFields.documents.forEach((doc, idx) => {
        const oldStatus = existing?.documents?.[idx]?.isApproved;
        const newStatus = doc?.isApproved;

        if ((oldStatus !== newStatus) || (oldStatus === undefined && newStatus === undefined)) {
          let title = "Document Status Changed";
          let descriptions = `Document '${doc?.documentName}' changed from "${oldStatus}" to "${newStatus}"`;

          if (oldStatus == undefined) {
            title = `New Document has been added for '${doc?.documentName}'`;
            descriptions = `New Document has been added for '${doc?.documentName}' and current status is "${newStatus === undefined ? 'Pending' : newStatus}"`;
          }

          notificationPromises.push(
            createNotification({
              notificationType: "Other",
              title: title,
              descriptions: descriptions,
              docs: [],
              createdBy: admin.id,
              userId: [userId],
            })
          );
        }
      });
    }

    // Notifications for UPDATED academic records (status changes and new additions)
    if (updateFields?.academics.length > 0) {
      updateFields.academics.forEach((academy, idx) => {
        const oldStatus = existing?.academics?.[idx]?.isApproved;
        const newStatus = academy?.isApproved;

        if ((oldStatus !== newStatus) || (oldStatus === undefined && newStatus === undefined)) {
          let title = "Academic Document Status Changed";
          let descriptions = `Academic document for '${academy.className}' changed from "${oldStatus}" to "${newStatus}"`;

          if (oldStatus == undefined) {
            title = "New Academic Document has been added.";
            descriptions = `New Academic Document has been added for '${academy.className}' and current status is "${newStatus === undefined ? 'Pending' : newStatus}"`;
          }

          notificationPromises.push(
            createNotification({
              notificationType: "Other",
              title: title,
              descriptions: descriptions,
              docs: [],
              createdBy: admin.id,
              userId: [userId],
            })
          );
        }
      });
    }

    // Wait for all notifications to be created
    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updated
    });
  })
);