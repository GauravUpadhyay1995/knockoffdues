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
    const userId = params.id;
    const admin = (req as any).user;

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
    }

    const existing = await User.findById(userId).lean();
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    console.log("formData>>>>>>>>>>>>>>>>>>>>>>>>", formData)
    const updateFields: any = {};
    const rawNested: Record<string, any[]> = {
      academics: [],
      documents: [],
      workExperience: []
    };
    const fileUploads: { key: string; file: File }[] = [];

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
      } else if (key === 'avatar') {
        updateFields.avatar = url;
      }
    }

    // ---- Helper to merge old & new arrays ----
    const mergeNested = (
      oldArr: any[],
      newArr: any[],
      boolFields: string[] = []
    ) => {
      const merged = oldArr.map((oldItem, i) => {
        const newItem = newArr[i] || {};
        const m = { ...oldItem, ...newItem };
        boolFields.forEach(f => (m[f] = String(m[f]) === 'true'));
        return m;
      });
      for (let i = oldArr.length; i < newArr.length; i++) {
        const m = { ...newArr[i] };
        boolFields.forEach(f => (m[f] = String(m[f]) === 'true'));
        merged.push(m);
      }
      return merged;
    };

    updateFields.academics = mergeNested(
      existing.academics || [],
      rawNested.academics || [],

    );

    updateFields.documents = mergeNested(
      existing.documents || [],
      rawNested.documents || [],

    );
  
if (updateFields?.documents.length > 0) {
  await Promise.all(
    updateFields.documents.map((doc, idx) => {
      const oldStatus = existing?.documents?.[idx]?.isApproved;
      const newStatus = doc?.isApproved;
      if (oldStatus !== newStatus) {
        return createNotification({
          notificationType: "Other",
          title: "Document Status Changed",
          descriptions: `Document '${doc?.documentName}' changed from "${oldStatus}" to "${newStatus}"`,
          docs: [],
          createdBy: admin.id,
          userId: [userId],
        });
      }
      return Promise.resolve();
    })
  );
}

if (updateFields?.academics.length > 0) {
  await Promise.all(
    updateFields.academics.map((academy, idx) => {
      const oldStatus = existing?.academics?.[idx]?.isApproved;
      const newStatus = academy?.isApproved;
      if (oldStatus !== newStatus) {
        return createNotification({
          notificationType: "Other",
          title: "Academic Document Status Changed",
          descriptions: `Academic document for '${academy.className}' changed from "${oldStatus}" to "${newStatus}"`,
          docs: [],
          createdBy: admin.id,
          userId: [userId],
        });
      }
      return Promise.resolve();
    })
  );
}


updateFields.workExperience = mergeNested(
  existing.workExperience || [],
  rawNested.workExperience || []
);


// ---- Single DB update ----
const updated = await User.findByIdAndUpdate(
  userId,
  { $set: updateFields },
  { new: true, runValidators: true }
);

return NextResponse.json({
  success: true,
  message: 'User updated successfully',
  data: updated
});
  })
);
