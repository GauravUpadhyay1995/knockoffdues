import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Team } from '@/models/Team';

export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get('search')?.trim();
    const name = searchParams.get('name')?.trim();
    const designation = searchParams.get('designation')?.trim();
    const department = searchParams.get('department')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = searchParams.get('perPage') || '10';
    const customLimit = parseInt(searchParams.get('customLimit') || '') || 0;
    const from = searchParams.get('from')?.trim() || '';

    const showAll = perPage === 'All';
    const limit = customLimit || (showAll ? 0 : parseInt(perPage) || 10);
    const skip = showAll ? 0 : (page - 1) * limit;

    // Build filter object
    const filter: Record<string, any> = {};
    if (name) filter.name = name;
    if (designation) filter.designation = designation;
    if (department) filter.department = department;
    if (from === 'frontend') filter.isActive = true;

    // Build the aggregation pipeline
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

    pipeline.push(
      {
        $project: {
          __v: 0,
          createdBy: 0,
          updatedBy: 0,
        },
      }
    );

    // Create separate pipelines for data and count
    const dataPipeline = [...pipeline, { $sort: { updatedAt: -1 } }];
    const countPipeline = [...pipeline, { $count: 'count' }];

    // Aggregation options with allowDiskUse to prevent memory issues
    const aggregationOptions = { allowDiskUse: true };

    try {
      // Execute queries in parallel
      const [teams, totalCountArr] = await Promise.all([
        // Get paginated results
        showAll 
          ? Team.aggregate(dataPipeline, aggregationOptions) 
          : Team.aggregate([...dataPipeline, { $skip: skip }, { $limit: limit }], aggregationOptions),
        // Get total count
        Team.aggregate(countPipeline, aggregationOptions)
      ]);

      const totalRecords = totalCountArr[0]?.count || 0;

      return sendResponse({
        success: true,
        message: teams.length ? 'Teams fetched successfully' : 'No teams found',
        data: {
          totalRecords,
          currentPage: page,
          perPage: showAll ? totalRecords : limit,
          teams,
          limit,
        },
      });
    } catch (error) {
      console.error('Aggregation error:', error);
      
      // Fallback: Use simpler query without aggregation for large datasets
      try {
        console.log('Trying fallback query without aggregation...');
        
        // Build fallback filter
        const fallbackFilter: any = { ...filter };
        if (search) {
          fallbackFilter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { designation: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
          ];
        }
        
        let query = Team.find(fallbackFilter)
          .select('-__v -createdBy -updatedBy')
          .sort({ updatedAt: -1 });
        
        if (!showAll) {
          query = query.skip(skip).limit(limit);
        }
        
        const [teams, totalRecords] = await Promise.all([
          query.exec(),
          Team.countDocuments(fallbackFilter)
        ]);

        return sendResponse({
          success: true,
          message: teams.length ? 'Teams fetched successfully' : 'No teams found',
          data: {
            totalRecords,
            currentPage: page,
            perPage: showAll ? totalRecords : limit,
            teams,
            limit,
          },
        });
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return sendResponse({
          success: false,
          message: 'Failed to fetch teams due to database error',
          data: null
        }, 500);
      }
    }
  });