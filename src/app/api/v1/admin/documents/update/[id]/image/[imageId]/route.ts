import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { sendResponse } from '@/lib/sendResponse';

export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
        await connectToDB();
        const { id: docId, imageId } = params;

        // 1. Validate IDs early and consolidate checks
        if (!Types.ObjectId.isValid(docId) || !Types.ObjectId.isValid(imageId)) {
            return sendResponse({ success: false, statusCode: 400, message: 'Invalid IDs.' });
        }

        const formData = await req.formData();
        const file = formData.get('documents') as File;

        if (!file) {
            return sendResponse({ success: false, statusCode: 400, message: 'documents file is required.' });
        }

        const oldDoc = await ImportantDocument.findOne({
            _id: docId,
            'documents._id': imageId,
        }).lean();

        if (!oldDoc) {
            return sendResponse({ success: false, statusCode: 404, message: 'Document or file not found.' });
        }

        const oldFileUrl = oldDoc.documents.find((img: any) => img._id.toString() === imageId)?.url;

        if (!oldFileUrl) {
            return sendResponse({ success: false, statusCode: 404, message: 'Document file URL not found in the database.' });
        }

        // 2. Perform a multi-step operation in sequence
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await uploadBufferToS3(buffer, file.type, file.name, 'documents');

        if (!upload?.url) {
            return sendResponse({ success: false, statusCode: 500, message: 'Image upload failed.' });
        }

        await deleteFromS3(oldFileUrl, 'documents');

        // 3. Perform a single atomic update to the document
        const updatedDoc = await ImportantDocument.findOneAndUpdate(
            { _id: docId, 'documents._id': imageId },
            {
                $set: {
                    'documents.$': {
                        url: upload.url,
                        mimetype: file.type,
                        size: file.size,
                        _id: new Types.ObjectId(imageId),
                    },
                    updatedBy: (req as any).user.id,
                },
            },
            { new: true, lean: true }
        );

        if (!updatedDoc) {
            return sendResponse({ success: false, statusCode: 404, message: 'Document not found after update.' });
        }

        return sendResponse({
            success: true,
            statusCode: 200,
            message: 'Document file updated successfully.',
            data: updatedDoc,
        });
    })
);

// ---------------------------------------------------------------------------------------------------------------------

export const DELETE = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
        await connectToDB();
        const { id: docId, imageId } = params;

        // 1. Validate IDs early
        if (!Types.ObjectId.isValid(docId) || !Types.ObjectId.isValid(imageId)) {
            return sendResponse({ success: false, statusCode: 400, message: 'Invalid IDs.' });
        }

        // 2. Perform a single atomic database operation
        const updatedDoc = await ImportantDocument.findByIdAndUpdate(
            docId,
            {
                $pull: { documents: { _id: imageId } },
                updatedBy: (req as any).user.id,
            },
            { new: true, lean: true }
        );

        if (!updatedDoc) {
            return sendResponse({ success: false, statusCode: 404, message: 'Document or file not found.' });
        }

        // 3. Delete the file from S3 using the URL from the original document
        const fileToDeleteUrl = updatedDoc.documents.find((doc: any) => doc._id.toString() === imageId)?.url;
        
        if (fileToDeleteUrl) {
            await deleteFromS3(fileToDeleteUrl, 'documents');
        } else {
            console.warn(`File URL not found for imageId: ${imageId}. Deleting from database only.`);
        }

        return sendResponse({
            success: true,
            statusCode: 200,
            message: 'Document file deleted successfully.',
            data: updatedDoc,
        });
    })
);