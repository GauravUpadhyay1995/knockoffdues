import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Department } from '@/models/Department';

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

    // Build match conditions
    const filter: Record<string, any> = {};
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (search) filter.$or = [{ department: { $regex: search, $options: 'i' } }];

    // Base pipeline
    const pipeline: any[] = [];
    if (Object.keys(filter).length > 0) {
        pipeline.push({ $match: filter });
    }

    pipeline.push(
        { $project: { __v: 0, createdBy: 0, updatedBy: 0 } },
        { $sort: { createdAt: -1 } }
    );

    const dataPipeline = [...pipeline];
    if (!showAll) {
        dataPipeline.push({ $skip: skip }, { $limit: limit });
    }

    const countPipeline = [...(Object.keys(filter).length ? [{ $match: filter }] : []), { $count: 'count' }];

    const aggregationOptions = { allowDiskUse: true };

    try {
        // Run in parallel
        const [departments, totalCountArr] = await Promise.all([
            Department.aggregate(dataPipeline, aggregationOptions),
            Department.aggregate(countPipeline, aggregationOptions)
        ]);

        const totalRecords = totalCountArr?.[0]?.count ?? 0;

        return sendResponse({
            success: true,
            message: departments.length ? 'Departments fetched successfully' : 'No departments found',
            data: {
                totalRecords,
                currentPage: page,
                perPage: showAll ? totalRecords : limit,
                totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
                departments
            }
        });
    } catch (error) {
        console.error('Aggregation error:', error);

        // Fallback to simpler query
        try {
            console.log('Trying fallback query without aggregation...');

            let query = Department.find(filter)
                .select('-__v')
                .sort({ createdAt: -1 });

            if (!showAll) {
                query = query.skip(skip).limit(limit);
            }

            const [departments, totalRecords] = await Promise.all([
                query.exec(),
                Department.countDocuments(filter)
            ]);

            return sendResponse({
                success: true,
                message: departments.length ? 'Departments fetched successfully' : 'No departments found',
                data: {
                    totalRecords,
                    currentPage: page,
                    perPage: showAll ? totalRecords : limit,
                    totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
                    departments
                }
            });
        } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return sendResponse(
                {
                    success: false,
                    message: 'Failed to fetch departments due to database error',
                    data: null
                },
                500
            );
        }
    }
});
