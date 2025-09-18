import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { User } from '@/models/User';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    const user = (req as any).user;
    const userId = params.id;

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
    }

    const existing = await User.findById(userId);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();

    // ------------------ Parse Form Data ------------------
    const rawBody: any = { academics: [], documents: [] ,workExperience: []};

    for (const [key, value] of formData.entries()) {
      if (key.includes('[documentFile]')) continue; // skip files (handled later)

      // Match academics[0][field]
      let match = key.match(/^academics\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!rawBody.academics[index]) rawBody.academics[index] = {};
        rawBody.academics[index][field] = value;
        continue;
      }

      // Match documents[0][field]
      match = key.match(/^documents\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!rawBody.documents[index]) rawBody.documents[index] = {};
        rawBody.documents[index][field] = value;
        continue;
      }
       // Match workExperience[0][field]
      match = key.match(/^workExperience\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!rawBody.workExperience[index]) rawBody.workExperience[index] = {};
        rawBody.workExperience[index][field] = value;
        continue;
      }

      // Normal fields
      rawBody[key] = value;
    }

    // ------------------ Handle Academic Files ------------------
    const academicDocs: any[] = [];
    const academicFileKeys = Array.from(formData.keys()).filter(k =>
      k.includes('academics') && k.endsWith('[documentFile]')
    );

    for (const key of academicFileKeys) {
      const file = formData.get(key) as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadBufferToS3(buffer, file.type, file.name, 'academics');
        if (uploaded?.url) {
          const indexMatch = key.match(/academics\[(\d+)\]/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1], 10);
            if (!academicDocs[index]) academicDocs[index] = {};
            academicDocs[index].documentUrl = uploaded.url;
          }
        }
      }
    }

    // ------------------ Handle Documents Files ------------------
    const userDocs: any[] = [];
    const docFileKeys = Array.from(formData.keys()).filter(k =>
      k.includes('documents') && k.endsWith('[documentFile]')
    );

    for (const key of docFileKeys) {
      const file = formData.get(key) as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadBufferToS3(buffer, file.type, file.name, 'documents');
        if (uploaded?.url) {
          const indexMatch = key.match(/documents\[(\d+)\]/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1], 10);
            if (!userDocs[index]) userDocs[index] = {};
            userDocs[index].documentUrl = uploaded.url;
          }
        }
      }
    }

    // ------------------Profile Image---------------------------
    let avatar;
    const file = formData.get('avatar') as File | null;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadBufferToS3(buffer, file.type, file.name, 'avatar');
      if (uploaded?.url) {
        avatar = uploaded.url;
      }
    }


    // ------------------ Build Update Object ------------------
    const updateFields: any = {
      ...rawBody,
      updatedBy: new Types.ObjectId(user.id),
    };
    // ✅ If avatar uploaded, overwrite
    if (avatar) {
      updateFields.avatar = avatar;
    }
    // Merge academics: prefer new file → else keep existing → else keep old url
    if (rawBody.academics?.length > 0 || academicDocs.length > 0) {
      updateFields.academics = rawBody.academics.map((a: any, i: number) => {
        const old = existing.academics?.[i] || {};
        return {
          ...old,
          ...a,
          ...(academicDocs[i]?.documentUrl
            ? { documentUrl: academicDocs[i].documentUrl }
            : a.documentUrl
              ? { documentUrl: a.documentUrl }
              : old.documentUrl
                ? { documentUrl: old.documentUrl }
                : {}),
        };
      });
    }

    // Merge documents: prefer new file → else keep existing → else keep old url
    if (rawBody.documents?.length > 0 || userDocs.length > 0) {
      updateFields.documents = rawBody.documents.map((d: any, i: number) => {
        const old = existing.documents?.[i] || {};
        return {
          ...old,
          ...d,
          ...(userDocs[i]?.documentUrl
            ? { documentUrl: userDocs[i].documentUrl }
            : d.documentUrl
              ? { documentUrl: d.documentUrl }
              : old.documentUrl
                ? { documentUrl: old.documentUrl }
                : {}),
        };
      });
    }

    // ------------------ Sanitize ObjectId fields ------------------
    // const objectIdFields = ['department', 'role'];
    // objectIdFields.forEach((field) => {
    //   if (!updateFields[field] || updateFields[field] === '') {
    //     updateFields[field] = null;
    //   }
    // });

    // ------------------ Update ------------------
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updated?.toObject(),
    });
  })
);
