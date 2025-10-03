import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Role } from '@/models/Role';
import mongoose from 'mongoose';

export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search')?.trim() || '';
    const role = searchParams.get('role')?.trim() || '';

    // Normalize and validate pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = searchParams.get('perPage')?.toLowerCase();
    const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;

    const showAll = perPage === 'all';
    const limit = customLimit || (showAll ? 0 : Math.min(parseInt(perPage || '10', 10), 100));
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 0) {
        return sendResponse({
            success: false,
            statusCode: 400,
            message: 'Invalid pagination parameters. Page and limit must be positive.',
        });
    }

    // Build the query filter for find()
    const filter: mongoose.FilterQuery<any> = {};
    const regexOptions = { $options: 'i' };

    if (search) {
        // A single regex search on the department field
        filter.role = { $regex: search, ...regexOptions };
    } else if (role) {
        // Fallback to department-specific search if 'search' is not used
        filter.role = { $regex: role, ...regexOptions };
    }
    filter.isActive = true;

    try {
        // Execute both queries in parallel for efficiency
        const [roles, totalRecords] = await Promise.all([
            Role.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(showAll ? 0 : limit)
                .select("-__v")
                // .populate("createdBy", "name email") // 👈 will show name & email
                .lean(),
            Role.countDocuments(filter),
        ]);


        const totalPages = showAll ? 1 : Math.ceil(totalRecords / limit);

        return sendResponse({
            success: true,
            statusCode: 200,
            message: roles.length ? 'Roles fetched successfully' : 'No role found',
            data: {
                roles,
                totalRecords,
                currentPage: page,
                perPage: showAll ? totalRecords : limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        return sendResponse({
            success: false,
            statusCode: 500,
            message: 'Failed to fetch roles due to a database error.',
        });
    }
});