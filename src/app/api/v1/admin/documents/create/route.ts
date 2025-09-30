import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { importantDocumentValidationSchema } from '@/lib/validations/document.schema';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { sendResponse } from '@/lib/sendResponse';

export const POST = verifyAdmin(
    asyncHandler(async (req: NextRequest) => {
        await connectToDB();
        const user = (req as any).user;
        const formData = await req.formData();

        const rawBody: any = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'documents') {
                rawBody[key] = value;
            }
        }

        // Validate all fields except 'documents'
        const { error, value } = importantDocumentValidationSchema.validate(rawBody, { abortEarly: false });
        if (error) {
            const formattedErrors = error.details.reduce((acc, curr) => {
                acc[curr.path[0] as string] = curr.message;
                return acc;
            }, {} as Record<string, string>);

            return sendResponse({
                success: false,
                statusCode: 400,
                message: 'Validation failed',
                errors: formattedErrors,
            });
        }

        const imageFiles = formData.getAll('documents') as File[];

        let imageMetaData: { url: string; mimetype: string; size: number }[] = [];

        if (imageFiles.length > 0) {
            try {
                // 1. Concurrent file uploads using Promise.all
                const uploadPromises = imageFiles.map(async (file) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const upload = await uploadBufferToS3(buffer, file.type, file.name, 'documents');
                    if (!upload?.url) {
                        console.error(`Upload failed for ${file.name}`);
                        return null;
                    }
                    return {
                        url: upload.url,
                        mimetype: file.type,
                        size: file.size,
                    };
                });
                
                // Wait for all uploads to complete
                const results = await Promise.all(uploadPromises);
                imageMetaData = results.filter(Boolean) as any[];

            } catch (s3Error) {
                console.error("S3 upload failed:", s3Error);
                return sendResponse({
                    success: false,
                    statusCode: 500,
                    message: "Failed to upload documents to storage",
                });
            }
        }

        // 2. Combine data and create document in a single step
        const docData = {
            ...value,
            documents: imageMetaData.length > 0 ? imageMetaData : undefined,
            createdBy: new Types.ObjectId(user.id),
            updatedBy: new Types.ObjectId(user.id),
        };

        try {
            const newDoc = new ImportantDocument(docData);
            const savedDoc = await newDoc.save();
            
            return sendResponse({
                success: true,
                statusCode: 201,
                message: 'Document created successfully',
                data: savedDoc.toObject(),
            });
        } catch (dbError) {
            console.error("Document creation failed:", dbError);
            return sendResponse({
                success: false,
                statusCode: 500,
                message: "Failed to create document in database",
            });
        }
    })
);