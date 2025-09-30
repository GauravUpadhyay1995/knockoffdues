import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { updateImportantDocSchema } from '@/lib/validations/document.schema';
import mongoose, { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { sendResponse } from '@/lib/sendResponse';

export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();
        const user = (req as any).user;
        const { id: documentId } = params;

        // 1. Validate ID and fetch the existing document in a single step
        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
            return sendResponse({ success: false, statusCode: 400, message: 'Invalid document ID.' });
        }
        
        const existingDoc = await ImportantDocument.findById(documentId).lean();
        if (!existingDoc) {
            return sendResponse({ success: false, statusCode: 404, message: 'Document not found.' });
        }

        const formData = await req.formData();
        const rawBody: any = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'documents') {
                rawBody[key] = value;
            }
        }
        
        // Joi validation on non-file fields
        const { error, value } = updateImportantDocSchema.validate(rawBody, { abortEarly: false });
        if (error) {
            const formattedErrors = error.details.reduce((acc, curr) => {
                acc[curr.path[0] as string] = curr.message;
                return acc;
            }, {} as Record<string, string>);
            return sendResponse({ success: false, statusCode: 400, message: 'Validation failed', errors: formattedErrors });
        }
        
        // 2. Upload new documents concurrently
        const fileList = formData.getAll('documents') as File[];
        let newDocs: { url: string; mimetype: string; size: number }[] = [];

        if (fileList.length > 0) {
            try {
                const uploadPromises = fileList.map(async (file) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const uploaded = await uploadBufferToS3(buffer, file.type, file.name, 'documents');
                    if (!uploaded?.url) {
                        return null; // Return null for failed uploads
                    }
                    return { url: uploaded.url, mimetype: file.type, size: file.size };
                });
                
                const results = await Promise.all(uploadPromises);
                newDocs = results.filter(Boolean) as any[]; // Filter out failed uploads
            } catch (s3Error) {
                console.error("S3 upload failed:", s3Error);
                return sendResponse({ success: false, statusCode: 500, message: 'Failed to upload documents.' });
            }
        }
        
        // 3. Prepare the final update object
        const updatedFields: any = {
            ...value,
            updatedBy: new Types.ObjectId(user.id),
        };
        
        // Merge existing and new documents
        const mergedDocuments = [...(existingDoc.documents || []), ...newDocs];
        if (mergedDocuments.length > 0) {
            updatedFields.documents = mergedDocuments;
        }

        // 4. Perform the atomic update and return the result
        const updatedDoc = await ImportantDocument.findByIdAndUpdate(
            documentId,
            updatedFields,
            { new: true, lean: true }
        );
        
        if (!updatedDoc) {
            return sendResponse({ success: false, statusCode: 404, message: 'Document not found after update.' });
        }

        return sendResponse({
            success: true,
            statusCode: 200,
            message: 'Document updated successfully.',
            data: updatedDoc,
        });
    })
);