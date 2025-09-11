import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Department } from '@/models/Department'; // make sure you import the model

export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = (searchParams.get('perPage') || '10').toLowerCase();
    const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;
    const showAll = perPage === 'all';
    const limit = customLimit || (showAll ? 0 : Math.min(parseInt(perPage, 10) || 10, 100));
    const skip = showAll ? 0 : (page - 1) * limit;

    if (page < 1 || limit < 0) {
        return sendResponse(
            { success: false, message: 'Invalid pagination parameters' },
            { status: 400 }
        );
    }

    // Build match condition
    const match: Record<string, any> = {};
    if (department) match.department = { $regex: department, $options: 'i' };

    const pipeline: any[] = [];

    if (search) {
        pipeline.push({
            $match: {
                $or: [{ department: { $regex: search, $options: 'i' } }],
            },
        });
    } else if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    pipeline.push(
        { $project: { __v: 0, createdBy: 0, updatedBy: 0, updatedAt: 0 } },
        { $sort: { createdAt: -1 } } // ✅ use createdAt since publishDate doesn't exist
    );

    if (!showAll) {
        pipeline.push({ $skip: skip }, { $limit: limit });
    }

    // Execute pipeline
    const docs = await Department.aggregate(pipeline);

    // Count total separately (without skip/limit)
    const countPipeline: any[] = [];
    if (search) {
        countPipeline.push({
            $match: { $or: [{ department: { $regex: search, $options: 'i' } }] },
        });
    } else if (Object.keys(match).length > 0) {
        countPipeline.push({ $match: match });
    }
    countPipeline.push({ $count: 'count' });

    const totalCountArr = await Department.aggregate(countPipeline);
    const totalRecords = totalCountArr?.[0]?.count ?? 0;

    return sendResponse({
        success: true,
        message: docs.length ? 'Department fetched successfully' : 'No Department found',
        data: {
            totalRecords,
            currentPage: page,
            perPage: showAll ? totalRecords : limit,
            departments: docs, // ✅ rename docs to Department
        },
    });

});
