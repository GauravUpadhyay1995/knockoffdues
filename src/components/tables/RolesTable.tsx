'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
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
import { UserPermissionGuard } from '@/components/common/PermissionGuard';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiDownload, FiChevronUp, FiX, FiRefreshCw, FiUserPlus } from 'react-icons/fi';

import LoadingScreen from "@/components/common/LoadingScreen";
import Label from "@/components/form/Label";
import AddRolesModal from "@/components/common/AddRoleModal";

interface Role {
    _id: string;
    role: string;
    isActive: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface RolesApiResponse {
    success: boolean;
    message?: string;
    isAuthorized?: boolean;
    data?: {
        roles?: Role[];
        totalRecords?: number;
        totalPages?: number;
        perPage?: number;
    };
}

interface Props {
    initialData: Role[];
}

export default function RolesListTable({ initialData }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [roles, setRoles] = useState<Role[]>(initialData);
    const [loading, setLoading] = useState(false);



    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const router = useRouter();

    const [filters, setFilters] = useState({
        role: '',
    });

    // Debounced filters with 500ms delay
    const debouncedFilters = useDebounce(filters, 500);

    // Fetch roles with current filters and pagination
    const fetchRoles = useCallback(
        async (abortController?: AbortController) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    perPage: pageSize.toString(),
                    ...(debouncedFilters.role && {
                        role: debouncedFilters.role,
                    }),
                });

                const response = await fetch(`/api/v1/admin/roles/list?${params}`, {
                    credentials: 'include',
                    signal: abortController?.signal,
                });

                if (response.status === 401) {
                    setIsAuthorized(false);
                    return;
                }

                const result: RolesApiResponse = await response.json();

                if (result.success && result.data) {
                    setRoles(result.data.roles || []);
                    setTotalRecords(result.data.totalRecords || 0);
                    setTotalPages(result.data.totalPages || 1);
                    setIsAuthorized(true);

                    if (currentPage > (result.data.totalPages || 1)) {
                        setCurrentPage(1);
                    }
                } else {
                    toast.error(result.message || 'Failed to load roles');
                    setRoles([]);
                    setTotalRecords(0);
                    setTotalPages(1);
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error('Error fetching roles:', error);
                toast.error('Error fetching role list');
                setRoles([]);
                setTotalRecords(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [currentPage, pageSize, debouncedFilters]
    );

    // Fetch when filters/page/pageSize change
    useEffect(() => {
        const abortController = new AbortController();
        fetchRoles(abortController);
        return () => abortController.abort();
    }, [fetchRoles]);

    const resetFilters = () => {
        setFilters({ role: '' });
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleEditClick = (role: Role) => {
        router.push(`roles/update/${role._id}`);
    };

    const changeStatus = async (role: Role) => {
        if (!role._id) return;

        const toUpdateData = {
            isActive: !role.isActive,
            role: role.role,
        };

        const promise = fetch(`/api/v1/admin/roles/update/${role._id}`, {
            method: 'PATCH', // ✅ Changed from PUT to PATCH
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(toUpdateData),
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
            success: (res) => res?.success ? 'Role updated successfully!' : null,
            error: (err) => err.message || 'Role Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchRoles();
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {

        }
    };

    const handleDownloadExcel = () => {
        const data = roles.map((role, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            'Role': role.role,
            'CreatedAt': role.createdAt
                ? new Date(role.createdAt).toLocaleString()
                : 'N/A',
            'UpdatedAt': role.updatedAt
                ? new Date(role.updatedAt).toLocaleString()
                : 'N/A',
            'Status': role.isActive
                ? "Active"
                : 'DeActive',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Roles');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        XLSX.writeFile(wb, `roles_export_${timestamp}.xlsx`);
    };
    const handleNameUpdate = async (role: Role) => {
        if (editingDeptId !== role._id) return; // not in edit mode

        const trimmedName = editedName.trim();
        setEditingDeptId(null); // exit edit mode

        if (!trimmedName || trimmedName === role.role) return; // no change

        const toUpdateData = {
            role: trimmedName,
            isActive: role.isActive,
        };

        const promise = fetch(`/api/v1/admin/roles/update/${role._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(toUpdateData),
        }).then(async (res) => {
            const text = await res.text();
            const result = text ? JSON.parse(text) : {};
            if (!res.ok || !result.success) {
                throw new Error(result.message || "Update failed");
            }
            return result;
        });

        toast.promise(promise, {
            loading: "Updating role...",
            success: "Role updated successfully!",
            error: (err) => err.message || "Update failed",
        });

        try {
            await promise;
            fetchRoles(); // refresh data
        } catch (error) {
            console.error("Update error:", error);
            // Optionally revert value instantly
            setEditedName(role.role);
        }
    };
    if (!isAuthorized) return <UnauthorizedComponent />;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && <LoadingScreen />}

            <UserPermissionGuard action="read">
                <div className="flex flex-col gap-4 p-4">
                    {/* Header with filters and controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white"></h2>

                        <div className="flex flex-wrap gap-2">
                            <AddRolesModal onRolesAdded={fetchRoles} />
                            <Button
                                onClick={() => fetchRoles()}
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
                                <FiDownload className="w-4 h-4" />
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
                                {showFilterPanel ? (
                                    <FiChevronUp className="w-4 h-4" />
                                ) : (
                                    <FiChevronDown className="w-4 h-4" />
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
                                <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <Label htmlFor="role-filter">Role</Label>
                                        <input
                                            id="role-filter"
                                            type="text"
                                            name="role"
                                            value={filters.role}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    role: e.target.value,
                                                }))
                                            }
                                            placeholder="Filter by role"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex justify-end">
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
                        <Label htmlFor="page-size">Roles per page:</Label>
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
                            roles
                        </span>
                    </div>
                </div>
            </UserPermissionGuard>

            {/* Roles Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Role</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created At</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Updated At</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {roles.length > 0 ? (
                            roles.map((role, index) => (
                                <TableRow key={role._id}>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <input
                                            ref={editingDeptId === role._id ? inputRef : null} // 🔑 focus when editing
                                            type="text"
                                            value={editingDeptId === role._id ? editedName.charAt(0).toUpperCase() + editedName.slice(1) : role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                                            readOnly={editingDeptId !== role._id || !role.isActive}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            onClick={() => {
                                                if (!role.isActive) return;
                                                setEditingDeptId(role._id);
                                                setEditedName(role.role);
                                            }}
                                            onBlur={() => role.isActive && handleNameUpdate(role)}
                                            onKeyDown={(e) => {
                                                if (role.isActive && e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleNameUpdate(role);
                                                }
                                            }}
                                            className={`w-full bg-transparent rounded px-1 py-0.5 focus:ring-2 ${role.isActive
                                                ? "focus:ring-purple-500"
                                                : "text-gray-400 italic cursor-not-allowed"
                                                }`}
                                        />

                                        {role.isActive && (
                                            <PencilSquareIcon
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-purple-600"
                                                onClick={() => {
                                                    setEditingDeptId(role._id);
                                                    setEditedName(role.role);
                                                    setTimeout(() => inputRef.current?.focus(), 0); // ✨ focus + blink
                                                }}
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {role.createdAt
                                            ? new Date(role.createdAt).toLocaleString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {role.updatedAt
                                            ? new Date(role.updatedAt).toLocaleString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <UserPermissionGuard action="update">
                                            {/* <Button
                                                onClick={() => handleEditClick(role)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                Edit
                                            </Button> */}
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={role.isActive}
                                                    onChange={() => changeStatus(role)}
                                                />
                                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600">
                                                </div>
                                            </label>
                                        </UserPermissionGuard>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    {loading ? 'Loading roles...' : 'No roles found'}
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
