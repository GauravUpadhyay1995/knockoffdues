'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiDownload, FiChevronUp, FiX, FiRefreshCw, FiEdit } from 'react-icons/fi';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Button from '@/components/ui/button/Button';
import Pagination from '../tables/Pagination';
import LoadingScreen from '@/components/common/LoadingScreen';
import Label from '@/components/form/Label';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import { UserPermissionGuard } from '@/components/common/PermissionGuard';
import AddReminderModal from '@/components/common/AddReminderModel';

import { useDebounce } from '@/hooks/useDebounce';

interface Reminder {
  _id: string;
  vendorName: string;
  senderReceiver: string;
  amount: number;
  vendorAddress?: string;
  billingDate: string;
  reminderType: 'BEFORE_DAYS' | 'WEEKLY';
  beforeDays: number;
  timeOfDay: string;
  paymentStatus: 'PAID' | 'PENDING';
  vendorStatus: boolean;
  description?: string;
  paymentMonth?: string;
  agreement?: string;
  payment?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface RemindersApiResponse {
  success: boolean;
  message?: string;
  isAuthorized?: boolean;
  data?: {
    reminders?: Reminder[];
    totalRecords?: number;
    totalPages?: number;
    perPage?: number;
  };
}

interface Props {
  initialData: Reminder[];
}

export default function ReminderListTable({ initialData }: Props) {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [filters, setFilters] = useState({
    vendorName: '',
    paymentStatus: '',
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Fetch reminders
  const fetchReminders = useCallback(async (abortController?: AbortController) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(debouncedFilters.vendorName && { q: debouncedFilters.vendorName }),
        ...(debouncedFilters.paymentStatus && { paymentStatus: debouncedFilters.paymentStatus }),
      });

      const res = await fetch(`/api/v1/admin/reminders/create?${params}`, {
        credentials: 'include',
        signal: abortController?.signal,
      });

      if (res.status === 401) {
        setIsAuthorized(false);
        return;
      }

      const result: RemindersApiResponse = await res.json();
      if (result.success && result.data) {
        setReminders(result.data || []);
        setTotalRecords(result.data.totalRecords || 0);
        setTotalPages(result.data.totalPages || 1);
        setIsAuthorized(true);
        if (currentPage > (result.data.totalPages || 1)) setCurrentPage(1);
      } else {
        toast.error(result.message || 'Failed to load reminders');
        setReminders([]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching reminders:', err);
        toast.error('Error fetching reminder list');
        setReminders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedFilters]);

  useEffect(() => {
    const ac = new AbortController();
    fetchReminders(ac);
    return () => ac.abort();
  }, [fetchReminders]);

  const resetFilters = () => {
    setFilters({ vendorName: '', paymentStatus: '' });
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const toggleEnabled = async (rem: Reminder) => {
    const promise = fetch(`/api/v1/admin/reminders/update/${rem._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorStatus: !rem.vendorStatus }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
      return data;
    });

    toast.promise(promise, {
      loading: 'Updating...',
      success: 'Reminder updated!',
      error: 'Failed to update',
    });

    try {
      await promise;
      fetchReminders();
    } catch { }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditModalOpen(true);

  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingReminder(null);
  };

  const handleDownloadExcel = () => {
    const data = reminders.map((r, idx) => ({
      'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
      'Vendor': r.vendorName,
      'Receiver': r.senderReceiver,
      'Amount': r.amount,
      'Billing Date': new Date(r.billingDate).toLocaleDateString(),
      'Reminder Type': r.reminderType,
      'Status': r.paymentStatus,
      'VendorStatus': r.vendorStatus ? 'Yes' : 'No',
      'Created': r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reminders');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(wb, `reminders_export_${ts}.xlsx`);
  };

  if (!isAuthorized) return <UnauthorizedComponent />;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
      {loading && <LoadingScreen />}

      <UserPermissionGuard action="read">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Vendor Reminders
            </h2>
            <div className="flex flex-wrap gap-2">

              <AddReminderModal onRemindersAdded={fetchReminders}
                editData={editingReminder}
                isEdit={isEditModalOpen}
                onClose={handleEditModalClose} />
              <Button onClick={() => fetchReminders()} variant="outline" size="sm">
                <FiRefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button onClick={handleDownloadExcel} variant="outline" size="sm">
                <FiDownload className="w-4 h-4" /> Excel
              </Button>
              <Button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                variant="outline"
                size="sm"
              >
                <FiFilter className="w-4 h-4" />
                {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                {showFilterPanel ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div>
                    <Label htmlFor="vendor-filter">Vendor Name</Label>
                    <input
                      id="vendor-filter"
                      type="text"
                      value={filters.vendorName}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, vendorName: e.target.value }))
                      }
                      placeholder="Search vendor"
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentStatus-filter">Status</Label>
                    <select
                      id="paymentStatus-filter"
                      value={filters.paymentStatus}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, paymentStatus: e.target.value }))
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                  <div className="flex justify-end md:col-span-2">
                    <Button onClick={resetFilters} variant="outline" size="sm">
                      <FiX className="w-4 h-4" /> Reset
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Per page:</Label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="p-2 border rounded-md dark:bg-gray-800 dark:text-white"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="ml-auto text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
            </span>
          </div>
        </div>
      </UserPermissionGuard>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Vendor</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Receiver</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Amount</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Billing Date</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Reminder Type</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Payment Status</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">VendorStatus</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {reminders.length ? (
              reminders.map((r, idx) => (
                <TableRow key={r._id}>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{r.vendorName}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{r.senderReceiver}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">₹{r.amount}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{new Date(r.billingDate).toLocaleDateString()}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{r.reminderType}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{r.paymentStatus}</TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={r.vendorStatus}
                        onChange={() => toggleEnabled(r)}
                      />
                      <div className="relative w-11 h-6 bg-red-500 dark:bg-red-500 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </TableCell>
                  <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                    <Button
                      onClick={() => handleEdit(r)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <FiEdit className="w-3 h-3" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  {loading ? 'Loading...' : 'No reminders found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRecords}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        </div>
      )}

      {/* Edit Modal */}

    </div>
  );
}