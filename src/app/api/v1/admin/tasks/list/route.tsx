import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Task } from '@/models/Task';
import mongoose from 'mongoose';

export const GET = verifyAdmin(asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;

    const searchParams = req.nextUrl.searchParams;

    // Filters from query params
    const taskName = searchParams.get('taskName');
    const description = searchParams.get('description');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const assignedBy = searchParams.get('assignedBy');
    let assignedTo;
    if (user.role == 'super admin') {
         assignedTo = searchParams.get('assignedTo') || ''; // single ID (optional)    

    } else {
         assignedTo = user.id; // single ID (optional)

    }
    const priority = searchParams.get('priority');
    const stage = searchParams.get('stage');
    const isActive = searchParams.get('isActive');

    const page = parseInt(searchParams.get('page') || '1');
    const perPage = searchParams.get('perPage') || '10';
    const showAll = perPage === 'All';
    const limit = showAll ? 0 : parseInt(perPage);
    const skip = showAll ? 0 : (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (taskName) filter.taskName = { $regex: taskName, $options: 'i' };
    if (description) filter.description = { $regex: description, $options: 'i' };
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    if (assignedBy) filter.assignedBy = new mongoose.Types.ObjectId(assignedBy);
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    if (stage) filter.stage = stage;
    if (isActive) filter.isActive = isActive === 'true';

    try {
        // Query with population
        let query = Task.find(filter)
            .populate('assignedBy', 'name email emp_id')   // populate assignedBy user
            .populate('createdBy', 'name email emp_id')
            .populate('updatedBy', 'name email emp_id')
            .sort({ updatedAt: -1 });

        if (!showAll) {
            query = query.skip(skip).limit(limit);
        }

        const [tasks, totalRecords] = await Promise.all([
            query.exec(),
            Task.countDocuments(filter)
        ]);

        return sendResponse({
            success: true,
            message: tasks.length ? 'Tasks fetched successfully' : 'No tasks found',
            data: {
                totalRecords,
                isAuthorized: true,
                currentPage: page,
                perPage: showAll ? totalRecords : limit,
                totalPages: showAll ? 1 : Math.ceil(totalRecords / limit),
                tasks,
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return sendResponse({
            success: false,
            message: 'Failed to fetch tasks',
            data: null
        }, 500);
    }
}));
