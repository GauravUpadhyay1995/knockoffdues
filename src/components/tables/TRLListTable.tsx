// TRLListTable.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
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
import Label from "@/components/form/Label";
import { toast } from 'react-hot-toast';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import PermissionGuard from '@/components/common/PermissionGuard';
import { usePermissions } from "@/context/PermissionContext";
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp, FiX, FiRefreshCw } from 'react-icons/fi';
import LoadingScreen from "@/components/common/LoadingScreen";

interface TrlApiResponse {
    success: boolean;
    message?: string;
    data?: {
        trls?: Trl[];
        totalRecords?: number;
        perPage?: number;
        limit?: number;
        currentPage?: number;
    };
}

interface Trl {
    _id: string;
    title: string;
    duration: string;
    amount: string;
    requirement: string;
    description: string;
    banner: string;
    tag: string;
    isActive: boolean;
    __v?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface Filters {
    title: string;
}

interface Props {
    initialData: Trl[];
}

export default function TRLListTable({ initialData }: Props) {
    const [trls, setTrls] = useState<Trl[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const router = useRouter();

    const [filters, setFilters] = useState<Filters>({
        title: '',
    });

    // Debounced filters with 500ms delay
    const debouncedFilters = useDebounce(filters, 500);

    // Fetch trls with current filters and pagination
    const fetchTrls = useCallback(async (abortController?: AbortController) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                perPage: pageSize.toString(),
                ...(debouncedFilters.title && { title: debouncedFilters.title }),
            });

            const response = await fetch(`/api/v1/admin/trl/list?${params}`, {
                credentials: 'include',
                signal: abortController?.signal,
            });

            if (response.status === 401) {
                setIsAuthorized(false);
                return;
            }

            const result: TrlApiResponse = await response.json();

            if (result.success && result.data) {
                setTrls(result.data.trls || []);
                setTotalRecords(result.data.totalRecords || 0);
                setTotalPages(Math.ceil((result.data.totalRecords || 0) / pageSize));
                setIsAuthorized(true);

                // Reset to first page if current page exceeds total pages
                if (currentPage > Math.ceil((result.data.totalRecords || 0) / pageSize)) {
                    setCurrentPage(1);
                }
            } else {
                toast.error(result.message || 'Failed to load TRLs');
                setTrls([]);
                setTotalRecords(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // Request was cancelled, do nothing
                return;
            }
            console.error('Error fetching TRLs:', error);
            toast.error('Error fetching TRL list');
            setTrls([]);
            setTotalRecords(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedFilters]);

    // Fetch trls when filters, page, or pageSize changes
    useEffect(() => {
        const abortController = new AbortController();
        fetchTrls(abortController);

        return () => {
            abortController.abort();
        };
    }, [fetchTrls]);

    const resetFilters = () => {
        setFilters({
            title: '',
        });
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when page size changes
    };

    const handleEditClick = (trl: Trl) => {
        router.push(`/admin/trl/add?id=${trl._id}`);
    };

    const changeStatus = async (trlId: string, isActive: boolean) => {
        if (!trlId) return;
        const formData = new FormData();
        formData.append('isActive', (!isActive).toString());
        const toUpdateData = {
            isActive: !isActive,
        };

        const promise = fetch(`/api/v1/admin/trl/update/${trlId}`, {
            method: 'PATCH',

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
            loading: 'Updating TRL...',
            success: (res) => res?.success ? 'TRL updated successfully!' : null,
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchTrls();
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleDownloadExcel = () => {
        // Prepare data for Excel
        const data = trls.map((trl, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            'Title': trl.title,
            'Duration': trl.duration || 'N/A',
            'Amount': trl.amount || 'N/A',
            'Tag': trl.tag || 'N/A',
            'Status': trl.isActive ? 'Active' : 'Inactive',
            'CreatedAt': trl.createdAt ? new Date(trl.createdAt).toLocaleString() : "N/A",
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'TRLs');

        // Generate file name with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `trls_export_${timestamp}.xlsx`;

        // Download the file
        XLSX.writeFile(wb, fileName);
    };

    if (!isAuthorized) {
        return <UnauthorizedComponent />;
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (
                <LoadingScreen />
            )}

            <PermissionGuard permission="trl.read">
                <div className="flex flex-col gap-4 p-4">
                    {/* Header with filters and controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white"></h2>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => fetchTrls()}
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <Label htmlFor="title-filter">Title</Label>
                                        <input
                                            id="title-filter"
                                            type="text"
                                            name="title"
                                            value={filters.title}
                                            onChange={handleFilterChange}
                                            placeholder="Filter by title"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="md:col-span-3 flex justify-end">
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
                        <Label htmlFor="page-size">TRLs per page:</Label>
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
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} TRLs
                        </span>
                    </div>
                </div>
            </PermissionGuard>

            {/* TRLs Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Title</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Duration</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Amount</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Tag</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Banner</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created At</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {trls.length > 0 ? (
                            trls.map((trl, index) => (
                                <TableRow key={trl._id}>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{trl.title}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{trl.duration || 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{trl.amount || 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{trl.tag || 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {trl.banner ? (
                                            <img
                                                src={trl.banner}
                                                alt="Banner"
                                                className="h-10 w-10 object-cover rounded shadow"
                                            />
                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {trl.createdAt ? new Date(trl.createdAt).toLocaleString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={trl.isActive}
                                                    onChange={() => changeStatus(trl._id, trl.isActive)}
                                                />
                                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600">
                                                </div>
                                            </label>
                                            <PermissionGuard permission="trl.update">
                                                <Button
                                                    onClick={() => handleEditClick(trl)}
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Edit TRL"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                    Edit
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {loading ? 'Loading TRLs...' : 'No TRLs found'}
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