import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Event } from '@/models/Event';

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const searchParams = req.nextUrl.searchParams;

  const search = searchParams.get('search')?.trim();
  const title = searchParams.get('title')?.trim();
  const venue = searchParams.get('venue')?.trim();
  const from = searchParams.get('from')?.trim() || '';

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = (searchParams.get('perPage') || '10').toLowerCase();
  const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;

  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : undefined;
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
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
  if (venue) filter.venue = { $regex: venue, $options: 'i' };
  if (startDate) filter.startDate = { $gte: startDate };
  if (endDate) filter.endDate = { ...filter.endDate, $lte: endDate };
  if (from === 'frontend') filter.isActive = true;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];
  }

  // Base aggregation pipeline
  const pipeline: any[] = [
    { $match: filter },
    { $project: { __v: 0, createdBy: 0, updatedBy: 0 } },
    { $sort: { startDate: -1 } },
  ];

  const dataPipeline = [...pipeline];
  const countPipeline = [...pipeline, { $count: 'count' }];

  if (!showAll) {
    dataPipeline.push({ $skip: skip }, { $limit: limit });
  }

  const aggregationOptions = { allowDiskUse: true };

  try {
    // Try aggregation first
    const [events, countResult] = await Promise.all([
      Event.aggregate(dataPipeline, aggregationOptions),
      Event.aggregate(countPipeline, aggregationOptions),
    ]);

    const totalRecords = countResult?.[0]?.count ?? 0;

    return sendResponse({
      success: true,
      message: events.length ? 'Events fetched successfully' : 'No events found',
      data: {
        totalRecords,
        currentPage: page,
        perPage: showAll ? totalRecords : limit,
        totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
        events,
        limit,
      },
    });
  } catch (error) {
    console.error('Aggregation failed, falling back to find():', error);

    try {
      // Fallback: simpler find query with lean()
      let query = Event.find(filter)
        .select('-__v -createdBy -updatedBy')
        .sort({ startDate: -1 })
        .lean();

      if (!showAll) {
        query = query.skip(skip).limit(limit);
      }

      const [events, totalRecords] = await Promise.all([
        query.exec(),
        Event.countDocuments(filter),
      ]);

      return sendResponse({
        success: true,
        message: events.length ? 'Events fetched successfully' : 'No events found',
        data: {
          totalRecords,
          currentPage: page,
          perPage: showAll ? totalRecords : limit,
          totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
          events,
          limit,
        },
      });
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return sendResponse(
        { success: false, message: 'Failed to fetch events due to database error', data: null },
        500
      );
    }
  }
});
