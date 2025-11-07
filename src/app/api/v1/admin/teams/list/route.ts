import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Team } from '@/models/Team';
import { decrypt, encrypt } from "@/lib/crypto";

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const encryptedData = req.nextUrl.searchParams.get('data');
  if (!encryptedData) {
    const encrypted = encrypt({ success: false, message: "Missing encrypted data", data: null });
    return new Response(JSON.stringify({ data: encrypted }), { status: 400 });
  }

  let params = {};
  try {
    const decodedData = decodeURIComponent(encryptedData);
    const decryptedString = decrypt<string>(decodedData);
    params = Object.fromEntries(new URLSearchParams(decryptedString));
  } catch (err) {
    const encrypted = encrypt({ success: false, message: "Invalid or corrupted encryption data", data: null });
    return new Response(JSON.stringify({ data: encrypted }), { status: 400 });
  }

  const search = (params as any).search?.trim();
  const name = (params as any).name?.trim();
  const designation = (params as any).designation?.trim();
  const department = (params as any).department?.trim();
  const page = Math.max(1, parseInt((params as any).page || '1'));
  const perPage = (params as any).perPage || '10';
  const customLimit = parseInt((params as any).customLimit || '') || 0;
  const from = (params as any).from?.trim() || '';

  const showAll = perPage === 'All';
  const limit = customLimit || (showAll ? 0 : parseInt(perPage) || 10);
  const skip = showAll ? 0 : (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (name) filter.name = name;
  if (designation) filter.designation = designation;
  if (department) filter.department = department;
  if (from === 'frontend') filter.isActive = true;

  const pipeline: any[] = [];

  if (search) {
    pipeline.push({
      $search: {
        index: 'default',
        compound: {
          should: [
            { text: { query: search, path: 'name' } },
            { text: { query: search, path: 'designation' } },
            { text: { query: search, path: 'department' } },
          ],
        },
      },
    });
  }

  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  pipeline.push({
    $project: {
      __v: 0,
      createdBy: 0,
      updatedBy: 0,
    },
  });

  const dataPipeline = [...pipeline, { $sort: { updatedAt: -1 } }];
  const countPipeline = [...pipeline, { $count: 'count' }];
  const aggregationOptions = { allowDiskUse: true };

  try {
    const [teams, totalCountArr] = await Promise.all([
      showAll
        ? Team.aggregate(dataPipeline, aggregationOptions)
        : Team.aggregate([...dataPipeline, { $skip: skip }, { $limit: limit }], aggregationOptions),
      Team.aggregate(countPipeline, aggregationOptions),
    ]);

    const totalRecords = totalCountArr[0]?.count || 0;

    // ✅ Encrypt the final response data
    const responsePayload = {
      success: true,
      message: teams.length ? 'Teams fetched successfully' : 'No teams found',
      data: {
        totalRecords,
        currentPage: page,
        perPage: showAll ? totalRecords : limit,
        teams,
        limit,
      },
    };

    const encrypted = encrypt(responsePayload);

    return new Response(JSON.stringify({ data: encrypted }), { status: 200 });
  } catch (error) {
    console.error('Aggregation error:', error);

    const encryptedError = encrypt({
      success: false,
      message: 'Failed to fetch teams due to database error',
      data: null,
    });
    return new Response(JSON.stringify({ data: encryptedError }), { status: 500 });
  }
});
