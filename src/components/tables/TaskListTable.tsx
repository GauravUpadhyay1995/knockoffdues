'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useRef } from "react";

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '../ui/table';
import Button from '@/components/ui/button/Button';
import Pagination from '../tables/Pagination';
import { toast } from 'react-hot-toast';
import { TaskPermissionGuard } from '@/components/common/PermissionGuard';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiDownload, FiChevronUp, FiX, FiRefreshCw, FiUserPlus, FiPlus } from 'react-icons/fi';

import LoadingScreen from "@/components/common/LoadingScreen";
import Label from "@/components/form/Label";
import AddTaskModal from "@/components/common/AddTaskModal";
import EditTaskModal from "@/components/common/EditTaskModal";

interface Task {
    _id: string;
    taskName: string;
    description: string;
    stage: 'Pending' | 'InProgress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    isActive: boolean;
    startDate: string | Date;
    endDate: string | Date;
    assignedTo?: string;
    assignedBy?: { _id: string, name: string; email: string };
    updatedBy?: { _id: string, name: string; email: string };
    createdBy: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface TasksApiResponse {
    success: boolean;
    message?: string;
    isAuthorized?: boolean;
    data?: {
        tasks?: Task[];
        totalRecords?: number;
        totalPages?: number;
        perPage?: number;
    };
}

interface Props {
    initialData: Task[];
}

export default function TaskListTable({ initialData }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [assignedByUserList, setAssignedByUserList] = useState<{ _id: string; name: string; email: string }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState<string>("");
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        taskName: '',
        stage: '',
        priority: '',
        isActive: '',
        startDate: '',
        endDate: '',
        assignedBy: '',
        assignedTo: '',
    });

    // Debounced filters with 500ms delay
    const debouncedFilters = useDebounce(filters, 500);

    // Fetch tasks with current filters and pagination
    const fetchTasks = useCallback(
        async (abortController?: AbortController) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    perPage: pageSize.toString(),
                    ...(debouncedFilters.taskName && { taskName: debouncedFilters.taskName }),
                    ...(debouncedFilters.stage && { stage: debouncedFilters.stage }),
                    ...(debouncedFilters.priority && { priority: debouncedFilters.priority }),
                    ...(debouncedFilters.isActive && { isActive: debouncedFilters.isActive }),
                    ...(debouncedFilters.startDate && { startDate: debouncedFilters.startDate }),
                    ...(debouncedFilters.endDate && { endDate: debouncedFilters.endDate }),
                    ...(debouncedFilters.assignedBy && { assignedBy: debouncedFilters.assignedBy }),
                    ...(debouncedFilters.assignedTo && { assignedTo: debouncedFilters.assignedTo }),
                });

                // Run both APIs in parallel
                const [tasksRes, usersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/list?${params}`, {
                        credentials: "include",
                        signal: abortController?.signal,
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=All&isActive=true`, {
                        credentials: "include",
                        signal: abortController?.signal,
                    }),
                ]);

                if (tasksRes.status === 401 || usersRes.status === 401) {
                    setIsAuthorized(false);
                    return;
                }

                const [tasksResult, usersResult] = await Promise.all([
                    tasksRes.json(),
                    usersRes.json(),
                ]);

                // ✅ handle tasks
                if (tasksResult.success && tasksResult.data) {
                    setTasks(tasksResult.data.tasks || []);
                    setTotalRecords(tasksResult.data.totalRecords || 0);
                    setTotalPages(tasksResult.data.totalPages || 1);
                    setIsAuthorized(true);

                    if (currentPage > (tasksResult.data.totalPages || 1)) {
                        setCurrentPage(1);
                    }
                } else {
                    toast.error(tasksResult.message || "Failed to load tasks");
                    setTasks([]);
                    setTotalRecords(0);
                    setTotalPages(1);
                }

                // ✅ handle users (for dropdowns etc.)
                if (usersResult.success && usersResult.data) {
                    setAssignedByUserList(usersResult.data.customers || []); // <-- you'll need state for this
                } else {
                    toast.error(usersResult.message || "Failed to load users");
                    setAssignedByUserList([]);
                }
            } catch (error: any) {
                if (error.name === "AbortError") return;
                console.error("Error fetching tasks/users:", error);
                toast.error("Error fetching task data");
                setTasks([]);
                setTotalRecords(0);
                setTotalPages(1);
                setAssignedByUserList([]);
            } finally {
                setLoading(false);
            }
        },
        [currentPage, pageSize, debouncedFilters]
    );


    // Fetch when filters/page/pageSize change
    useEffect(() => {
        const abortController = new AbortController();
        fetchTasks(abortController);
        return () => abortController.abort();
    }, [fetchTasks]);

    const resetFilters = () => {
        setFilters({ taskName: '', stage: '', priority: '', isActive: '', startDate: '', endDate: '', assignedBy: '', assignedTo: '' });
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleEditClick = (task: Task) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        router.push(`tasks/create`);
    };

    const changeStatus = async (task: Task) => {
        if (!task._id) return;
        const submitData = new FormData();
        submitData.append("isActive", !task.isActive);

        const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/update/${task._id}`, {
            method: 'PUT',

            body: submitData,
        }).then(async (res) => {
            try {
                const text = await res.text();
                const result = text ? JSON.parse(text) : {};

                if (!res.ok || !result.success) {
                    toast.error(result.message || 'Update failed');
                }

                return result;
            } catch (error) {
                console.error('Failed to parse response:', error);
                toast.error('Invalid server response');
                throw new Error('Invalid server response');
            }
        });

        toast.promise(promise, {
            loading: 'Updating task...',
            success: (res) => res?.success ? 'Task updated successfully!' : null,
            error: (err) => err.message || 'Task Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleDownloadExcel = () => {
        const data = tasks.map((task, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            'Title': task.taskName,
            'Stage': task.stage,
            'Priority': task.priority,
            'Due Date': task.startDate
                ? new Date(task.startDate).toLocaleDateString()
                : 'N/A',
            'Assigned By': task.assignedBy ? task.assignedBy.name : 'N/A',
            'Last Updated By': task.updatedBy ? task.updatedBy.name : 'N/A',

            'Updated At': task.updatedAt
                ? new Date(task.updatedAt).toLocaleString()
                : 'N/A',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        XLSX.writeFile(wb, `tasks_export_${timestamp}.xlsx`);
    };

    const handleTitleUpdate = async (task: Task) => {
        if (editingTaskId !== task._id) return;

        const trimmedTitle = editedTitle.trim();
        setEditingTaskId(null);

        if (!trimmedTitle || trimmedTitle === task.taskName) return;
        const submitData = new FormData();
        submitData.append("taskName", trimmedTitle);
        const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/update/${task._id}`, {
            method: "PUT",
            body: submitData,
        }).then(async (res) => {
            const text = await res.text();
            const result = text ? JSON.parse(text) : {};
            if (!res.ok || !result.success) {
                throw new Error(result.message || "Update failed");
            }
            return result;
        });

        toast.promise(promise, {
            loading: "Updating task...",
            success: "Task updated successfully!",
            error: (err) => err.message || "Update failed",
        });

        try {
            await promise;
            fetchTasks();
        } catch (error) {
            console.error("Update error:", error);
            setEditedTitle(task.taskName);
        }
    };

    if (!isAuthorized) return <UnauthorizedComponent />;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && <LoadingScreen />}

            <TaskPermissionGuard action="read">
                <div className="flex flex-col gap-4 p-4">
                    {/* Header with filters and controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white"></h2>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FiPlus className="w-6 h-6" />
                                Add Task
                            </Button>


                            <Button
                                onClick={() => fetchTasks()}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FiRefreshCw className="w-6 h-6" />
                                Refresh
                            </Button>

                            <Button
                                onClick={handleDownloadExcel}
                                variant="outline"
                                size="sm"
                            >
                                <FiDownload className="w-6 h-6" />
                                Download Excel
                            </Button>

                            <Button
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FiFilter className="w-6 h-6" />
                                {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                                {showFilterPanel ? (
                                    <FiChevronUp className="w-6 h-6" />
                                ) : (
                                    <FiChevronDown className="w-6 h-6" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilterPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-8 gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

                                    <div>
                                        <Label htmlFor="taskName-filter">Task</Label>
                                        <input
                                            id="taskName-filter"
                                            type="text"
                                            name="taskName"
                                            value={filters.taskName}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    taskName: e.target.value,
                                                }))
                                            }
                                            placeholder="Filter by taskName"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="stage-filter">Stage</Label>
                                        <select
                                            id="stage-filter"
                                            value={filters.stage}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    stage: e.target.value,
                                                }))
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Stages</option>
                                            <option value="Pending">Pending</option>
                                            <option value="InProgress">InProgress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="priority-filter">Priority</Label>
                                        <select
                                            id="priority-filter"
                                            value={filters.priority}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    priority: e.target.value,
                                                }))
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Priorities</option>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="status-filter">Status</Label>
                                        <select
                                            id="status-filter"
                                            value={filters.isActive}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    isActive: e.target.value,
                                                }))
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="true">Active</option>
                                            <option value="false">DeActive</option>

                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="startDate-filter">Start Date</Label>
                                        <input
                                            id="startDate-filter"
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    startDate: e.target.value,
                                                }))
                                            }
                                            placeholder="Filter by startDate"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate-filter">End Date</Label>
                                        <input
                                            id="endDate-filter"
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    endDate: e.target.value,
                                                }))
                                            }
                                            placeholder="Filter by endDate"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="assignedBy-filter">Assigned By</Label>
                                        <select
                                            id="assignedBy-filter"
                                            value={filters.assignedBy || ""}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    assignedBy: e.target.value,
                                                }))
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Users</option>
                                            {assignedByUserList.map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name}  ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="assignedTo-filter">Assigned To</Label>
                                        <select
                                            id="assignedTo-filter"
                                            value={filters.assignedTo || ""}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    assignedTo: e.target.value,
                                                }))
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Users</option>
                                            {assignedByUserList.map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>



                                    <div className="flex justify-end md:col-span-8">
                                        <Button
                                            onClick={resetFilters}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <FiX className="w-6 h-6" />
                                            Reset Filters
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="page-size">Tasks per page:</Label>
                        <select
                            id="page-size"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>

                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                            Showing {(currentPage - 1) * pageSize + 1} to{' '}
                            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}{' '}
                            tasks
                        </span>
                    </div>
                </div>
            </TaskPermissionGuard>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Task</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Stage</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Priority</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Start - End Date</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Assigned By</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Last Updated By</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Updated At</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-Medium text-start text-theme-xs text-gray-500">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => (
                                <TableRow key={task._id}>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <input
                                            ref={editingTaskId === task._id ? inputRef : null}
                                            type="text"
                                            value={editingTaskId === task._id ? editedTitle : task.taskName}
                                            readOnly={editingTaskId !== task._id || !task.isActive}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            onClick={() => {
                                                if (!task.isActive) return;
                                                setEditingTaskId(task._id);
                                                setEditedTitle(task.taskName);
                                            }}
                                            onBlur={() => task.isActive && handleTitleUpdate(task)}
                                            onKeyDown={(e) => {
                                                if (task.isActive && e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleTitleUpdate(task);
                                                }
                                            }}
                                            className={`w-full bg-transparent rounded px-1 py-0.5 focus:ring-2 ${task.isActive
                                                ? "focus:ring-green-500"
                                                : "text-gray-400 italic cursor-not-allowed"
                                                }`}
                                        />

                                        {task.isActive && (
                                            <PencilSquareIcon
                                                className="w-6 h-6 cursor-pointer text-gray-500 hover:text-green-600"
                                                onClick={() => {
                                                    setEditingTaskId(task._id);
                                                    setEditedTitle(task.taskName);
                                                    setTimeout(() => inputRef.current?.focus(), 0);
                                                }}
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-Medium ${task.stage === 'Completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : task.stage === 'InProgress'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                            {task.stage}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-Medium ${task.priority === 'High'
                                            ? 'bg-orange-500 text-orange-100 dark:bg-orange-500 dark:text-orange-100'
                                            : task.priority === 'Medium'
                                                ? 'bg-yellow-500 text-white dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-green-600 text-green-100 dark:bg-green-900 dark:text-green-100'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {task.startDate
                                            ? new Date(task.startDate).toLocaleDateString()
                                            : 'N/A'} - {task.endDate
                                                ? new Date(task.endDate).toLocaleDateString()
                                                : 'N/A'}
                                    </TableCell>

                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {task.assignedBy
                                            ? task.assignedBy?.name
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {task.updatedBy
                                            ? task.updatedBy?.name
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {task.updatedAt
                                            ? new Date(task.updatedAt).toLocaleString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-4">
                                            {/* Edit Button */}
                                            <TaskPermissionGuard action="update">
                                                <PencilSquareIcon
                                                    className={`w-6 h-6  transition-colors ${task.isActive
                                                        ? "text-gray-500 hover:text-green-600 cursor-pointer"
                                                        : "text-gray-300 cursor-not-allowed"
                                                        }`}
                                                    onClick={task.isActive ? () => handleEditClick(task) : undefined}
                                                />

                                            </TaskPermissionGuard>

                                            {/* Status Toggle */}
                                            <TaskPermissionGuard action="update">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={task.isActive}
                                                        onChange={() => changeStatus(task)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 dark:bg-gray-700                         peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full                         peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full  after:h-5 after:w-5 after:transition-all dark:border-gray-600       peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                                                    </div>
                                                </label>
                                            </TaskPermissionGuard>

                                            {/* Details Badge */}
                                            <TaskPermissionGuard action="read">
                                                <span
                                                    onClick={() => router.push(`tasks/${task._id}`)}
                                                    className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-orange-100                    dark:bg-orange-500 dark:text-orange-100 cursor-pointer
"
                                                >
                                                    Details
                                                </span>
                                            </TaskPermissionGuard>
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center align-middle py-8 dark:text-white text-gray-600"
                                >
                                    {loading ? 'Loading tasks...' : 'No tasks found'}
                                </TableCell>
                            </TableRow>

                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalRecords}
                        onPageChange={setCurrentPage}
                        itemsPerPage={pageSize}
                    />
                </div>
            )}
            <AddTaskModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onTaskAdded={fetchTasks}

            />
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onTaskUpdated={() => {
                    setIsEditModalOpen(false);
                    fetchTasks();
                }}
                task={selectedTask}
            />
        </div>
    );
}