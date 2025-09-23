'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import { toast } from 'react-hot-toast';
import { useModal } from "@/hooks/useModal";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { UserPermissionGuard } from '@/components/common/PermissionGuard';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp, FiX, FiRefreshCw } from 'react-icons/fi';
import LoadingScreen from "@/components/common/LoadingScreen";


interface UsersApiResponse {
    success: boolean;
    message?: string;
    isAuthorized?: boolean;
    data?: {
        customers?: User[];
        totalRecords?: number;
        perPage?: number;
    };
}

interface Permission {
    module: string;
    actions: string[];
    _id?: string;
}

interface UpdateUserData {
    name: string;
    email: string;
    mobile: string;
    role?: string;
    isActive: boolean;
    permissions: Omit<Permission, '_id'>[];
    password?: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
    permissions?: Permission[];
    __v?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface Filters {
    name: string;
    email: string;
}

const PermissionToggle = ({
    module,
    permissions,
    setPermissions
}: {
    module: string;
    permissions: Permission[];
    setPermissions: (permissions: Permission[]) => void;
}) => {
    const availableActions = ['create', 'read', 'update', 'delete'];
    const modulePermissions = permissions.find(p => p.module == module) || { module, actions: [] };

    const toggleAction = (action: string) => {
        const newPermissions = permissions.map(perm =>
            perm.module === module
                ? {
                    module,
                    actions: perm.actions.includes(action)
                        ? perm.actions.filter(a => a !== action)
                        : [...perm.actions, action]
                }
                : perm
        );
        setPermissions(newPermissions);
    };

    const toggleSelectAll = (checked: boolean) => {
        const newPermissions = checked
            ? [
                ...permissions.filter(p => p.module !== module),
                { module, actions: [...availableActions] }
            ]
            : [
                ...permissions.filter(p => p.module !== module),
                { module, actions: [] }
            ];
        setPermissions(newPermissions);
    };

    const allSelected = availableActions.every(action =>
        modulePermissions.actions.includes(action)
    );

    return (
        <div className="border p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{module}</h4>
                <div className="flex items-center space-x-2">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={allSelected}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600">
                        </div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            All
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex flex-row gap-2">
                {availableActions.map(action => (
                    <div key={action} className="flex items-center gap-2">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={modulePermissions.actions.includes(action)}
                                onChange={() => toggleAction(action)}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600">
                            </div>
                            <span className="ms-3 text-xs font-medium text-gray-900 dark:text-gray-300 capitalize">
                                {action}
                            </span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PermissionManager = ({
    permissions,
    setPermissions
}: {
    permissions: Permission[];
    setPermissions: (permissions: Permission[]) => void;
}) => {
    const availableModules = useCallback(() => ['User', 'Customer', 'Coupon'], []);

    // Initialize permissions if empty
    useEffect(() => {
        if (permissions.length === 0) {
            setPermissions(
                availableModules().map(module => ({
                    module,
                    actions: []
                }))
            );
        }
    }, [availableModules, permissions.length, setPermissions]);

    return (
        <div className="space-y-4">
            {availableModules().map(module => (
                <PermissionToggle
                    key={module}
                    module={module}
                    permissions={permissions}
                    setPermissions={setPermissions}
                />
            ))}
        </div>
    );
};

interface Props {
    initialData: User[];
}


// Optimized UsersListTable component
export default function UsersListTable({ initialData }: Props) {
    const [users, setUsers] = useState<User[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const router = useRouter();

    const [filters, setFilters] = useState({
        name: '',
        email: '',
        department: '',
        role: '',
        isActive: ''
    });

    // Debounced filters with 500ms delay
    const debouncedFilters = useDebounce(filters, 500);

    const { isOpen, openModal, closeModal } = useModal();
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        isActive: true,
        role: '',
        permissions: [] as Permission[]
    });

    // Fetch users with current filters and pagination
    const fetchUsers = useCallback(async (abortController?: AbortController) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                perPage: pageSize.toString(),
                ...(debouncedFilters.name && { name: debouncedFilters.name }),
                ...(debouncedFilters.email && { email: debouncedFilters.email }),
                ...(debouncedFilters.department && { department: debouncedFilters.department }),
                ...(debouncedFilters.role && { role: debouncedFilters.role }),
                ...(debouncedFilters.isActive && { isActive: debouncedFilters.isActive }),
            })


            const response = await fetch(`/api/v1/admin/users/list?${params}`, {
                credentials: 'include',
                signal: abortController?.signal,
            });

            if (response.status === 401) {
                setIsAuthorized(false);
                return;
            }

            const result: UsersApiResponse = await response.json();

            if (result.success && result.data) {
                setUsers(result.data.customers || []);
                setTotalRecords(result.data.totalRecords || 0);
                setTotalPages(result.data.totalPages || 1);
                setIsAuthorized(true);

                // Reset to first page if current page exceeds total pages
                if (currentPage > (result.data.totalPages || 1)) {
                    setCurrentPage(1);
                }
            } else {
                toast.error(result.message || 'Failed to load users');
                setUsers([]);
                setTotalRecords(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // Request was cancelled, do nothing
                return;
            }
            console.error('Error fetching users:', error);
            toast.error('Error fetching user list');
            setUsers([]);
            setTotalRecords(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedFilters]);

    // Fetch users when filters, page, or pageSize changes
    useEffect(() => {
        const abortController = new AbortController();
        fetchUsers(abortController);

        return () => {
            abortController.abort();
        };
    }, [fetchUsers]);



    const resetFilters = () => {
        setFilters({
            name: '',
            email: '',
            department: '',
            role: '',
            isActive: ''
        });
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when page size changes
    };

    const handleEditClick = (user: User) => {
        router.push(`users/update/${user._id}`);
    };


    const handleCreateClick = () => {
        setCreateFormData({
            name: '',
            email: '',
            password: '',
            mobile: '',
            role: 'user',
            permissions: []
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async () => {
        if (!createformData.name || !createformData.email || !createformData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        const promise = fetch(`/api/v1/admin/users/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...createformData,
                isActive: true,
                permissions: createformData.permissions
            }),
        }).then(async (res) => {
            const result = await res.json();
            if (!res.ok || !result.success) {
                toast.error(result.message);
            }
            return result;
        });

        toast.promise(promise, {
            loading: 'Creating user...',
            success: (res) => res?.success ? 'User created successfully!' : null,
            error: (err) => err.message || 'Creation failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchUsers();
                setCreateFormData({ name: '', email: '', password: '', mobile: '', role: 'user', permissions: [] });
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error('Create error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const changeStatus = async (user: User) => {
        if (!user._id) return;
        const formData = new FormData();
        formData.append('isActive', (!user.isActive).toString());
        formData.append('email', user.email);
        setIsSubmitting(true);



        const promise = fetch(`/api/v1/admin/users/update/${user._id}`, {
            method: 'PATCH', // ✅ Changed from PUT to PATCH
            body: formData,
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
            loading: 'Updating user...',
            success: (res) => res?.success ? 'User updated successfully!' : null,
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editUserId) return;

        if (!formData.name || !formData.email) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        // Create update data without _id in permissions
        const updateData: UpdateUserData = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            role: formData.role,
            isActive: formData.isActive,
            permissions: formData.permissions.map(({ ...rest }) => rest)
        };

        if (formData.password?.trim()) {
            updateData.password = formData.password.trim();
        }

        const promise = fetch(`/api/v1/admin/users/update/${editUserId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        }).then(async (res) => {
            const result = await res.json();
            if (!res.ok || !result.success) {
                toast.error(result.message);
            }
            return result;
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: (res) => res?.success ? 'User updated successfully!' : null,
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchUsers();
                closeModal();
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };



    const handleDownloadExcel = () => {
        // Prepare data for Excel
        const data = users.map((user, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            'Name': user.name,
            'Email': user.email,
            'Role': user.role || 'User',
            'Status': user.isActive ? 'Active' : 'Inactive',
            'CreatedAt': user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A",
            'UpdatedAt': user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A",
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');

        // Generate file name with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `users_export_${timestamp}.xlsx`;

        // Download the file
        XLSX.writeFile(wb, fileName);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments/list?perPage=all`,)
                ]);

                setTimeout(() => {


                    // Ensure array
                    const deptArray = Array.isArray(deptRes.data.data)
                        ? deptRes.data.data
                        : deptRes.data.data?.departments || [];

                    setDepartments(deptArray);
                }, 800);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            }
        };

        fetchData();
    }, []);
    if (!isAuthorized) {
        return <UnauthorizedComponent />;
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (

                <LoadingScreen />

            )}

            <UserPermissionGuard action="read">
                <div className="flex flex-col gap-4 p-4">
                    {/* Header with filters and controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-400"></h2>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => fetchUsers()}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>

                            <Button
                                onClick={handleDownloadExcel}
                                variant="outline"
                                size="sm"
                            >
                                Download Excel
                            </Button>

                            <Button
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FiFilter className="w-4 h-4" />
                                {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                                {showFilterPanel ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilterPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <Label htmlFor="name-filter">Name</Label>
                                        <input
                                            id="name-filter"
                                            type="text"
                                            name="name"
                                            value={filters.name}
                                            onChange={handleFilterChange}
                                            placeholder="Filter by name"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email-filter">Email</Label>
                                        <input
                                            id="email-filter"
                                            type="text"
                                            name="email"
                                            value={filters.email}
                                            onChange={handleFilterChange}
                                            placeholder="Filter by email"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="branch-filter">Department</Label>
                                        <select
                                            onChange={handleFilterChange}
                                            name='department'
                                            value={filters.department}
                                            className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="" >
                                                Select Department
                                            </option>
                                            {departments.map((dept) => (
                                                <option key={dept._id} value={dept._id}>
                                                    {dept.department}
                                                </option>
                                            ))}

                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="branch-filter">Role</Label>
                                        <select
                                            onChange={handleFilterChange}
                                            name='role'
                                            value={filters.role}
                                            className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="" >
                                                Select Role
                                            </option>
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                            <option value="lead">Lead</option>


                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="branch-filter">Status</Label>
                                        <select
                                            onChange={handleFilterChange}
                                            name='isActive'
                                            value={filters.isActive}
                                            className="dark:text-gray-400 w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="" >
                                                Select Status
                                            </option>
                                            <option value="true">Active</option>
                                            <option value="false">DeActive</option>
                                            <option value="rejected">Rejected Lead</option>
                                            <option value="fresh">Fresh Lead</option>


                                        </select>
                                    </div>


                                    <div className="md:col-span-5 flex justify-end">
                                        <Button
                                            onClick={resetFilters}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <FiX className="w-4 h-4" />
                                            Reset Filters
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="page-size">Users per page:</Label>
                        <select
                            id="page-size"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-400"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>

                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} users
                        </span>
                    </div>
                </div>
            </UserPermissionGuard>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created/Updated</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Name</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Department</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Email</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Role</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Status</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {users.length > 0 ? (
                            users.map((user, index) => (
                                <TableRow key={user._id}>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{user.createdAt
                                        ? new Date(user.createdAt).toLocaleString()
                                        : 'N/A'}<br></br>{user.updatedAt
                                            ? new Date(user.updatedAt).toLocaleString()
                                            : 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{user.name}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize">
                                            {user.department || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <span className={`${user.role == "user" ? " bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : " bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"} px-2 py-1 text-xs font-medium rounded-full  capitalize`}>
                                            {user.role || 'user'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={user.isActive}
                                                onChange={() => changeStatus(user)}
                                                disabled={user.role == 'super admin' || isSubmitting}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                                            </div>
                                        </label>
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <UserPermissionGuard action="update">
                                            <Button
                                                onClick={() => handleEditClick(user)}
                                                variant="ghost"
                                                size="sm"
                                                title="Edit user"
                                                disabled={user.role == 'super admin' || isSubmitting}
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                                Edit
                                            </Button>
                                        </UserPermissionGuard>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {loading ? 'Loading users...' : 'No users found'}
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
        </div>
    );
}