'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
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
import PermissionGuard from '@/components/common/PermissionGuard';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import { usePermissions } from "@/context/PermissionContext";
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiDownload, FiChevronUp, FiX, FiRefreshCw, FiPlus } from 'react-icons/fi';
import LoadingScreen from '@/components/common/LoadingScreen';
import Label from '@/components/form/Label';
import AddTaskModal from '@/components/common/AddTaskModal';
import EditTaskModal from '@/components/common/EditTaskModal';

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
  assignedBy?: { _id: string; name: string; email: string, emp_id: string; };
  updatedBy?: { _id: string; name: string; email: string, emp_id: string; };
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
  };
}

interface Filters {
  taskName: string;
  stage: string;
  priority: string;
  isActive: string;
  startDate: string;
  endDate: string;
  assignedBy: string;
  assignedTo: string;
}

interface Props {
  initialData: Task[];
}

// Memoized TaskListTable component
const TaskListTable = memo(function TaskListTable({ initialData }: Props) {
  const { permissions } = usePermissions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<Task[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [assignedByUserList, setAssignedByUserList] = useState<{ _id: string; name: string; email: string, emp_id: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const router = useRouter();

  const [filters, setFilters] = useState<Filters>({
    taskName: '',
    stage: '',
    priority: '',
    isActive: '',
    startDate: '',
    endDate: '',
    assignedBy: '',
    assignedTo: '',
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Fetch tasks and users
  const fetchTasks = useCallback(
    async (abortController?: AbortController) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          perPage: pageSize.toString(),
          ...Object.fromEntries(Object.entries(debouncedFilters).filter(([_, value]) => value)),
        });

        const [tasksRes, usersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/list?${params}`, {
            credentials: 'include',
            signal: abortController?.signal,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=All&isActive=true&isVerified=true`, {
            credentials: 'include',
            signal: abortController?.signal,
          }),
        ]);

        if (tasksRes.status === 401 || usersRes.status === 401) {
          setIsAuthorized(false);
          return;
        }

        const [tasksResult, usersResult] = await Promise.all([tasksRes.json(), usersRes.json()]);

        if (tasksResult.success && tasksResult.data) {
          setTasks(tasksResult.data.tasks || []);
          setTotalRecords(tasksResult.data.totalRecords || 0);
          setTotalPages(tasksResult.data.totalPages || 1);
          setIsAuthorized(true);

          if (currentPage > (tasksResult.data.totalPages || 1)) {
            setCurrentPage(1);
          }
        } else {
          toast.error(tasksResult.message || 'Failed to load tasks');
          setTasks([]);
          setTotalRecords(0);
          setTotalPages(1);
        }

        if (usersResult.success && usersResult.data) {
          setAssignedByUserList(usersResult.data.customers || []);
        } else {
          toast.error(usersResult.message || 'Failed to load users');
          setAssignedByUserList([]);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching tasks/users:', error);
          toast.error('Error fetching task data');
          setTasks([]);
          setTotalRecords(0);
          setTotalPages(1);
          setAssignedByUserList([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, debouncedFilters]
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchTasks(abortController);
    return () => abortController.abort();
  }, [fetchTasks]);

  const resetFilters = useCallback(() => {
    setFilters({ taskName: '', stage: '', priority: '', isActive: '', startDate: '', endDate: '', assignedBy: '', assignedTo: '' });
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const handleEditClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleAddClick = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const changeStatus = useCallback(
    async (task: Task) => {
      if (!task._id) return;

      const submitData = new FormData();
      submitData.append('isActive', String(!task.isActive));

      const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/update/${task._id}`, {
        method: 'PATCH', // Changed to PATCH for partial updates
        body: submitData,
      }).then(async res => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Update failed');
        }
        return result;
      });

      toast.promise(promise, {
        loading: 'Updating task...',
        success: result => result.success ? 'Task updated successfully!' : null,
        error: err => err.message || 'Task update failed',
      });

      try {
        await promise;
        fetchTasks();
      } catch (error) {
        console.error('Update error:', error);
      }
    },
    [fetchTasks]
  );

  const handleTitleUpdate = useCallback(
    async (task: Task) => {
      if (editingTaskId !== task._id) return;
      if (!permissions.includes("task.update")) {
        toast.error('You dont have permission');
        return;
      }

      const trimmedTitle = editedTitle.trim();
      setEditingTaskId(null);

      if (!trimmedTitle || trimmedTitle === task.taskName) return;


      const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/update/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskName: trimmedTitle }),
      }).then(async res => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Update failed');
        }
        return result;
      });

      toast.promise(promise, {
        loading: 'Updating task...',
        success: 'Task updated successfully!',
        error: err => err.message || 'Update failed',
      });

      try {
        await promise;
        fetchTasks();
      } catch (error) {
        console.error('Update error:', error);
        setEditedTitle(task.taskName);
      }
    },
    [editingTaskId, editedTitle, fetchTasks]
  );

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }, []);

  const handleDownloadExcel = useCallback(() => {
    const data = tasks.map((task, idx) => ({
      'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
      Title: task.taskName,
      Stage: task.stage,
      Priority: task.priority,
      'Due Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A',
      'Assigned By': task.assignedBy ? task.assignedBy.name : 'N/A',
      'Last Updated By': task.updatedBy ? task.updatedBy.name : 'N/A',
      'Updated At': task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(wb, `tasks_export_${timestamp}.xlsx`);
  }, [tasks, currentPage, pageSize]);

  if (!isAuthorized) return <UnauthorizedComponent />;
  if (!permissions.includes("task.read")) {
    return <UnauthorizedComponent />;
  }
  const canUpdateTask = permissions.includes("task.update");
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
      {loading && <LoadingScreen />}

      <PermissionGuard permission="task.read">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white"></h2>
            <div className="flex flex-wrap gap-2">
              <PermissionGuard permission="task.create">
                <Button
                  onClick={handleAddClick}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-6 h-6" />
                  Add Task
                </Button></PermissionGuard>
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
                className="flex items-center gap-2"
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
                {showFilterPanel ? <FiChevronUp className="w-6 h-6" /> : <FiChevronDown className="w-6 h-6" />}
              </Button>
            </div>
          </div>

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
                      onChange={handleFilterChange}
                      placeholder="Filter by task name"
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stage-filter">Stage</Label>
                    <select
                      id="stage-filter"
                      name="stage"
                      value={filters.stage}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Stages</option>
                      <option value="Pending">Pending</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority-filter">Priority</Label>
                    <select
                      id="priority-filter"
                      name="priority"
                      value={filters.priority}
                      onChange={handleFilterChange}
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
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="startDate-filter">Start Date</Label>
                    <input
                      id="startDate-filter"
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
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
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedBy-filter">Assigned By</Label>
                    <select
                      id="assignedBy-filter"
                      name="assignedBy"
                      value={filters.assignedBy}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Users</option>
                      {assignedByUserList.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.emp_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo-filter">Assigned To</Label>
                    <select
                      id="assignedTo-filter"
                      name="assignedTo"
                      value={filters.assignedTo}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Users</option>
                      {assignedByUserList.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.emp_id})
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

          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Tasks per page:</Label>
            <select
              id="page-size"
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} tasks
            </span>
          </div>
        </div>
      </PermissionGuard>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Task</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Stage</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Priority</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Start - End Date</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Assigned By</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Last Updated By</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Updated At</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
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
                      readOnly={
                        editingTaskId !== task._id ||
                        !task.isActive ||
                        !canUpdateTask
                      }
                      onChange={e => {
                        if (!canUpdateTask) return; // ⛔ block update
                        setEditedTitle(e.target.value);
                      }}
                      onClick={() => {
                        if (!task.isActive || !canUpdateTask) return; // ⛔ block edit mode
                        setEditingTaskId(task._id);
                        setEditedTitle(task.taskName);
                      }}
                      onBlur={() => {
                        if (task.isActive && canUpdateTask) {
                          handleTitleUpdate(task);
                        }
                      }}
                      onKeyDown={e => {
                        if (task.isActive && canUpdateTask && e.key === 'Enter') {
                          e.preventDefault();
                          handleTitleUpdate(task);
                        }
                      }}
                      className={`w-full bg-transparent rounded px-1 py-0.5 
    ${task.isActive && canUpdateTask
                          ? "focus:ring-2 focus:ring-green-500"
                          : "text-gray-400 italic cursor-not-allowed"
                        }
  `}
                    />

                    {task.isActive && (
                      <PermissionGuard permission="task.update">
                        <PencilSquareIcon
                          className="w-6 h-6 cursor-pointer text-gray-500 hover:text-green-600"
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setEditedTitle(task.taskName);
                            setTimeout(() => inputRef.current?.focus(), 0);
                          }}
                        /></PermissionGuard>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${task.stage === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : task.stage === 'InProgress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                    >
                      {task.stage}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'High'
                        ? 'bg-orange-500 text-orange-100 dark:bg-orange-500 dark:text-orange-100'
                        : task.priority === 'Medium'
                          ? 'bg-yellow-500 text-white dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-600 text-green-100 dark:bg-green-900 dark:text-green-100'
                        }`}
                    >
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'} -{' '}
                    {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    {task.assignedBy?.name || 'N/A'}
                    <br></br>
                    {task.assignedBy?.emp_id}
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    {task.updatedBy?.name || 'N/A'} <br></br>
                    {task.updatedBy?.emp_id}
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <PermissionGuard permission="task.update">
                        <PencilSquareIcon
                          className={`w-6 h-6 transition-colors ${task.isActive ? 'text-gray-500 hover:text-green-600 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                          onClick={task.isActive ? () => handleEditClick(task) : undefined}
                        />
                      </PermissionGuard>
                      <PermissionGuard permission="task.update">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={task.isActive}
                            onChange={() => changeStatus(task)}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600" />
                        </label>
                      </PermissionGuard>
                      <PermissionGuard permission="task.read">
                        <span
                          onClick={() => router.push(`tasks/${task._id}`)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-orange-100 dark:bg-orange-500 dark:text-orange-100 cursor-pointer"
                        >
                          Details
                        </span>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center align-middle py-8 dark:text-white text-gray-600">
                  {loading ? 'Loading tasks...' : 'No tasks found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTaskAdded={fetchTasks} />
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
});

TaskListTable.displayName = 'TaskListTable';

export default TaskListTable;