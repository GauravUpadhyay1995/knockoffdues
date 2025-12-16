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

interface TeamsApiResponse {
    success: boolean;
    message?: string;
    data?: {
        teams?: Team[];
        totalRecords?: number;
        perPage?: number;
        limit?: number;
        currentPage?: number;
    };
}

interface Team {
    _id: string;
    name: string;
    designation?: string;
    department?: string;
    mobile?: string;
    showingOrder?: number;
    profileImage?: string;
    socialLinks?: any[];
    isActive?: boolean;
    __v?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface Filters {
    name: string;
    designation: string;
    department: string;
}

interface Props {
    initialData: Team[];
}

// Optimized TeamsListTable component
export default function TeamsListTable({ initialData }: Props) {
    const [teams, setTeams] = useState<Team[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const router = useRouter();

    const [filters, setFilters] = useState<Filters>({
        name: '',
        designation: '',
        department: '',
    });

    // Debounced filters with 500ms delay
    const debouncedFilters = useDebounce(filters, 500);

    // Fetch teams with current filters and pagination
    const fetchTeams = useCallback(async (abortController?: AbortController) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                perPage: pageSize.toString(),
                ...(debouncedFilters.name && { name: debouncedFilters.name }),
                ...(debouncedFilters.designation && { designation: debouncedFilters.designation }),
                ...(debouncedFilters.department && { department: debouncedFilters.department }),
            });

            const response = await fetch(`/api/v1/admin/teams/list?${params}`, {
                credentials: 'include',
                signal: abortController?.signal,
            });

            if (response.status === 401) {
                setIsAuthorized(false);
                return;
            }

            const result: TeamsApiResponse = await response.json();

            if (result.success && result.data) {
                setTeams(result.data.teams || []);
                setTotalRecords(result.data.totalRecords || 0);
                setTotalPages(Math.ceil((result.data.totalRecords || 0) / pageSize));
                setIsAuthorized(true);

                // Reset to first page if current page exceeds total pages
                if (currentPage > Math.ceil((result.data.totalRecords || 0) / pageSize)) {
                    setCurrentPage(1);
                }
            } else {
                toast.error(result.message || 'Failed to load teams');
                setTeams([]);
                setTotalRecords(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // Request was cancelled, do nothing
                return;
            }
            console.error('Error fetching teams:', error);
            toast.error('Error fetching team list');
            setTeams([]);
            setTotalRecords(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedFilters]);

    // Fetch teams when filters, page, or pageSize changes
    useEffect(() => {
        const abortController = new AbortController();
        fetchTeams(abortController);

        return () => {
            abortController.abort();
        };
    }, [fetchTeams]);

    const resetFilters = () => {
        setFilters({
            name: '',
            designation: '',
            department: '',
        });
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when page size changes
    };

  
    const handleEditClick = (team: any) => {
        console.log("Edit team:", team);
        router.push(`/admin/teams/add?id=${team._id}`);
    };

    const changeStatus = async (teamId: string, isActive: boolean) => {
        if (!teamId) return;

        const toUpdateData = {
            isActive: !isActive,
        };

        const promise = fetch(`/api/v1/admin/teams/update/${teamId}`, {
            method: 'PATCH',
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
            loading: 'Updating team...',
            success: (res) => res?.success ? 'Team updated successfully!' : null,
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchTeams();
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
        const data = teams.map((team, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            'Name': team.name,
            'Designation': team.designation || 'N/A',
            'Department': team.department || 'N/A',
            'Status': team.isActive ? 'Active' : 'Inactive',
            'CreatedAt': team.createdAt ? new Date(team.createdAt).toLocaleString() : "N/A",
            'UpdatedAt': team.updatedAt ? new Date(team.updatedAt).toLocaleString() : "N/A",
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Teams');

        // Generate file name with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `teams_export_${timestamp}.xlsx`;

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

            <PermissionGuard permission="team.read">
                <div className="flex flex-col gap-4 p-4">
                    {/* Header with filters and controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white"></h2>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => fetchTeams()}
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
                                        <Label htmlFor="name-filter">Name</Label>
                                        <input
                                            id="name-filter"
                                            type="text"
                                            name="name"
                                            value={filters.name}
                                            onChange={handleFilterChange}
                                            placeholder="Filter by name"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="designation-filter">Designation</Label>
                                        <input
                                            id="designation-filter"
                                            type="text"
                                            name="designation"
                                            value={filters.designation}
                                            onChange={handleFilterChange}
                                            placeholder="Filter by designation"
                                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="department-filter">Department</Label>
                                        <input
                                            id="department-filter"
                                            type="text"
                                            name="department"
                                            value={filters.department}
                                            onChange={handleFilterChange}
                                            placeholder="Filter by department"
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
                        <Label htmlFor="page-size">Teams per page:</Label>
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
                             <option value="500">500</option>
                        </select>

                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} teams
                        </span>
                    </div>
                </div>
            </PermissionGuard>

            {/* Teams Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Name</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Designation</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Department</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Status</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {teams.length > 0 ? (
                            teams.map((team, index) => (
                                <TableRow key={team._id}>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{team.name}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{team.designation || 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{team.department || 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${team.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {team.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <PermissionGuard permission="team.update">
                                            <Button
                                                onClick={() => handleEditClick(team)}
                                                variant="ghost"
                                                size="sm"
                                                title="Edit team"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                                Edit
                                            </Button>
                                        </PermissionGuard>
                                        
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {loading ? 'Loading teams...' : 'No teams found'}
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