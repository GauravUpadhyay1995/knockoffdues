import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { withAuth } from '@/lib/withAuth';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export const GET = verifyAdmin(asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const searchParams = req.nextUrl.searchParams;
  const customer = searchParams.get('customer');
  const mobile = searchParams.get('mobile');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = searchParams.get('perPage') || '10';
  const name = searchParams.get('name');
  const email = searchParams.get('email');
  const department = searchParams.get('department');
  const role = searchParams.get('role');
  const isActive = searchParams.get('isActive');

  const showAll = perPage === 'All';
  const limit = showAll ? 0 : parseInt(perPage);
  const skip = showAll ? 0 : (page - 1) * limit;

  // Build the filter object
  const filter: any = {};

  if (mobile) filter.mobile = mobile;
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (department) filter.department = new mongoose.Types.ObjectId(department);
  if (role) filter.role = { $regex: role, $options: 'i' };
  if (isActive) filter.isActive = isActive === 'true';

  // Build the aggregation pipeline
  const pipeline: any[] = [];

  // Add filter stage if any filters are present
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // Add lookup for department and verified_by user
  pipeline.push(
    // Lookup department
    {
      $lookup: {
        from: 'departments',           // <-- collection name for departments
        localField: 'department',
        foreignField: '_id',
        as: 'departmentInfo'
      }
    },
    {
      $addFields: {
        department: { $arrayElemAt: ['$departmentInfo.department', 0] }
      }
    },
    // Lookup verified_by user
    {
      $lookup: {
        from: 'users',
        localField: 'verified_by',
        foreignField: '_id',
        as: 'verified_user'
      }
    },
    {
      $addFields: {
        verified_by: { $arrayElemAt: ['$verified_user.name', 0] }
      }
    },
    {
      $project: {
        otp: 0,
        __v: 0,
        verified_user: 0,
        password: 0,
        departmentInfo: 0
      }
    }
  );

  // Create separate pipelines for data and count
  const dataPipeline = [...pipeline, { $sort: { updatedAt: -1 } }];
  const countPipeline = [...pipeline, { $count: 'count' }];

  // Aggregation options with allowDiskUse
  const aggregationOptions = { allowDiskUse: true };

  try {
    // Execute queries in parallel
    const [customers, totalCount] = await Promise.all([
      showAll
        ? User.aggregate(dataPipeline, aggregationOptions)
        : User.aggregate([...dataPipeline, { $skip: skip }, { $limit: limit }], aggregationOptions),
      User.countDocuments(filter)
    ]);

    const totalRecords = totalCount;

    return sendResponse({
      success: true,
      message: customers.length ? 'Customers fetched successfully' : 'No customers found',
      data: {
        totalRecords,
        isAuthorized: true,
        currentPage: page,
        perPage: showAll ? totalRecords : limit,
        totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
        customers,
      }
    });
  } catch (error) {
    console.error('Aggregation error:', error);

    // Fallback: Use simpler query without aggregation
    try {
      console.log('Trying fallback query without aggregation...');

      let query = User.find(filter)
        .select('-otp -__v -password -verified_user')
        .sort({ updatedAt: -1 })
        .populate('department', 'department'); // <-- populate department name directly

      if (!showAll) {
        query = query.skip(skip).limit(limit);
      }

      const [customers, totalRecords] = await Promise.all([
        query.exec(),
        User.countDocuments(filter)
      ]);

      return sendResponse({
        success: true,
        message: customers.length ? 'Customers fetched successfully' : 'No customers found',
        data: {
          totalRecords,
          isAuthorized: true,
          currentPage: page,
          perPage: showAll ? totalRecords : limit,
          totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
          customers,
        }
      });
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return sendResponse({
        success: false,
        message: 'Failed to fetch customers due to database error',
        data: null
      }, 500);
    }
  }
}));
