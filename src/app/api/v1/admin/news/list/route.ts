// src/app/api/v1/admin/news/route.ts

import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
 
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { News } from '@/models/News';

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const params = req.nextUrl.searchParams;
  const search = params.get('search')?.trim();
  const from = params.get('from')?.trim() || '';

  const title = params.get('title')?.trim();
  const category = params.get('category')?.trim();
  const page = Math.max(1, parseInt(params.get('page') || '1'));
  const perPage = params.get('perPage') || '10';
  const customLimit = parseInt(params.get('customLimit') || '') || 0;

  const showAll = perPage === 'All';
  const limit = showAll ? 0 : customLimit || parseInt(perPage) || 10;
  const skip = (page - 1) * limit;

  const match: Record<string, any> = {};
  if (title) match.title = title;
  if (category) match.category = category;
  if (from === 'frontend') match.isActive = true;

  const pipeline: any[] = [];

  // Atlas Search or Fallback to regex
  if (search) {
    pipeline.push({
      $search: {
        index: 'default',
        compound: {
          should: [
            { text: { query: search, path: 'title' } },
            { text: { query: search, path: 'category' } },
            { text: { query: search, path: 'description' } },
          ],
        },
      },
    });
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  pipeline.push({
    $project: {
      __v: 0,
      createdBy: 0,
      updatedBy: 0,
    },
  });

  const facetPipeline = [
    ...pipeline,
    {
      $facet: {
        paginatedResults: [
          { $sort: { updatedAt: -1 } },
          ...(showAll ? [] : [{ $skip: skip }, { $limit: limit }]),
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  // ✅ Important: allowDiskUse for large dataset safety
  const [result] = await News.aggregate(facetPipeline).option({ allowDiskUse: true });

  const news = result?.paginatedResults || [];
  const totalRecords = result?.totalCount?.[0]?.count || 0;

  return sendResponse({
    success: true,
    message: news.length ? 'News fetched successfully' : 'No news found',
    data: {
      totalRecords,
      currentPage: page,
      perPage: showAll ? totalRecords : limit,
      news,
      limit,
    },
  });
});
