import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { ImportantDocument } from '@/models/ImportantDocument';

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const searchParams = req.nextUrl.searchParams;
  const from = searchParams.get('from')?.trim() || '';
  const search = searchParams.get('search')?.trim() || '';
  const title = searchParams.get('title')?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = (searchParams.get('perPage') || '10').toLowerCase();
  const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;
  const publishDate = searchParams.get('publishDate')
    ? new Date(searchParams.get('publishDate')!)
    : undefined;

  const showAll = perPage === 'all';
  const limit = customLimit || (showAll ? 0 : Math.min(parseInt(perPage, 10) || 10, 100));
  const skip = showAll ? 0 : (page - 1) * limit;

  if (page < 1 || limit < 0) {
    return sendResponse({ success: false, message: 'Invalid pagination parameters' }, 400);
  }

  // Build filter
  const filter: Record<string, any> = {};
  if (title) filter.title = { $regex: title, $options: 'i' };
  if (publishDate) filter.publishDate = { $gte: publishDate };
  if (from === 'frontend') filter.isActive = true;
  if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }];

  // Base pipeline
  const pipeline: any[] = [
    { $match: filter },
    { $project: { __v: 0, createdBy: 0, updatedBy: 0, updatedAt: 0 } },
    { $sort: { publishDate: -1 } },
  ];

  const dataPipeline = [...pipeline];
  const countPipeline = [...pipeline, { $count: 'count' }];

  // Add pagination stages
  if (!showAll) {
    dataPipeline.push({ $skip: skip }, { $limit: limit });
  }

  const aggregationOptions = { allowDiskUse: true };

  try {
    // Try aggregation first
    const [docs, countResult] = await Promise.all([
      ImportantDocument.aggregate(dataPipeline, aggregationOptions),
      ImportantDocument.aggregate(countPipeline, aggregationOptions),
    ]);

    const totalRecords = countResult?.[0]?.count ?? 0;

    return sendResponse({
      success: true,
      message: docs.length ? 'Docs fetched successfully' : 'No docs found',
      data: {
        totalRecords,
        currentPage: page,
        perPage: showAll ? totalRecords : limit,
        totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
        docs,
        limit,
      },
    });
  } catch (error) {
    console.error('Aggregation failed, falling back to find():', error);

    // Fallback with lean() for performance
    try {
      let query = ImportantDocument.find(filter)
        .select('-__v -createdBy -updatedBy -updatedAt')
        .sort({ publishDate: -1 })
        .lean();

      if (!showAll) {
        query = query.skip(skip).limit(limit);
      }

      const [docs, totalRecords] = await Promise.all([
        query.exec(),
        ImportantDocument.countDocuments(filter),
      ]);

      return sendResponse({
        success: true,
        message: docs.length ? 'Docs fetched successfully' : 'No docs found',
        data: {
          totalRecords,
          currentPage: page,
          perPage: showAll ? totalRecords : limit,
          totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
          docs,
          limit,
        },
      });
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return sendResponse(
        { success: false, message: 'Failed to fetch docs due to database error', data: null },
        500
      );
    }
  }
});
