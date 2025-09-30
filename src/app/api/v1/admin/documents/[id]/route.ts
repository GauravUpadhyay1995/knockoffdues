import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import mongoose from 'mongoose';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const documentId = params?.id;

    // 1. Consolidated ID validation
    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
        return sendResponse({
            success: false,
            statusCode: 400,
            message: 'Invalid or missing document ID.',
        });
    }

    try {
        // 2. Single, efficient query with lean()
        const document = await ImportantDocument.findById(documentId)
            .select('-__v -updatedAt -createdAt')
            .lean();

        // 3. Handle document not found
        if (!document) {
            return sendResponse({
                success: false,
                statusCode: 404,
                message: 'Document not found.',
            });
        }

        // 4. Return success response with a better caching header
        return sendResponse({
            success: true,
            statusCode: 200,
            message: 'Document fetched successfully.',
            data: document,
        }, {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        });

    } catch (error) {
        console.error('Error fetching document:', error);
        return sendResponse({
            success: false,
            statusCode: 500,
            message: 'Failed to fetch document due to a server error.',
        });
    }
});