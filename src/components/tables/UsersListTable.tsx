'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Edit, Trash2, Eye, Download } from "lucide-react";
import Swal from "sweetalert2";
import TableActions from "./TableAction";
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import Button from '@/components/ui/button/Button';
import Pagination from '../tables/Pagination';
import Label from '@/components/form/Label';
import { toast } from 'react-hot-toast';
import { UserPermissionGuard } from '@/components/common/PermissionGuard';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp, FiX, FiRefreshCw } from 'react-icons/fi';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import LoadingScreen from '@/components/common/LoadingScreen';

interface UsersApiResponse {
  success: boolean;
  message?: string;
  isAuthorized?: boolean;
  data?: {
    customers?: User[];
    totalRecords?: number;
    totalPages?: number;
  };
}

interface Permission {
  module: string;
  actions: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: string;
  isActive?: boolean;
  permissions?: Permission[];
  department?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  resume?: string;
  avatar?: string;
  emp_id?: string;
}

interface Filters {
  name: string;
  email: string;
  department: string;
  role: string;
  isActive: string;
}

interface FormData {
  name: string;
  email: string;
  password?: string;
  mobile: string;
  role: string;
  isActive: boolean;
  permissions: Permission[];
}

interface Props {
  initialData: User[];
}

// Memoized PermissionToggle component
const PermissionToggle = memo(
  ({ module, permissions, setPermissions }: { module: string; permissions: Permission[]; setPermissions: (permissions: Permission[]) => void }) => {
    const availableActions = ['create', 'read', 'update', 'delete'];
    const modulePermissions = permissions.find(p => p.module === module) || { module, actions: [] };

    const toggleAction = useCallback((action: string) => {
      setPermissions(
        permissions.map(perm =>
          perm.module === module
            ? {
              module,
              actions: perm.actions.includes(action)
                ? perm.actions.filter(a => a !== action)
                : [...perm.actions, action],
            }
            : perm
        )
      );
    }, [module, permissions, setPermissions]);

    const toggleSelectAll = useCallback((checked: boolean) => {
      setPermissions(
        checked
          ? [...permissions.filter(p => p.module !== module), { module, actions: [...availableActions] }]
          : [...permissions.filter(p => p.module !== module), { module, actions: [] }]
      );
    }, [module, permissions, setPermissions]);

    const allSelected = useMemo(
      () => availableActions.every(action => modulePermissions.actions.includes(action)),
      [modulePermissions.actions]
    );

    return (
      <div className="border p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{module}</h4>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={allSelected}
              onChange={e => toggleSelectAll(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600" />
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">All</span>
          </label>
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
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600" />
                <span className="ms-3 text-xs font-medium text-gray-900 dark:text-gray-300 capitalize">{action}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PermissionToggle.displayName = 'PermissionToggle';

// Memoized PermissionManager component
const PermissionManager = memo(
  ({ permissions, setPermissions }: { permissions: Permission[]; setPermissions: (permissions: Permission[]) => void }) => {
    const availableModules = useMemo(() => ['User', 'Customer', 'Coupon'], []);

    useEffect(() => {
      if (permissions.length === 0) {
        setPermissions(availableModules.map(module => ({ module, actions: [] })));
      }
    }, [permissions.length, setPermissions, availableModules]);

    return (
      <div className="space-y-4">
        {availableModules.map(module => (
          <PermissionToggle key={module} module={module} permissions={permissions} setPermissions={setPermissions} />
        ))}
      </div>
    );
  }
);

PermissionManager.displayName = 'PermissionManager';

export default function UsersListTable({ initialData }: Props) {
  const [users, setUsers] = useState<User[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);


  const [filters, setFilters] = useState<Filters>({
    name: '',
    email: '',
    department: '',
    role: '',
    isActive: '',
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Unified form state for both create and edit
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'user',
    isActive: true,
    permissions: [],
  });

  // Fetch users with current filters and pagination
  const fetchUsers = useCallback(
    async (abortController?: AbortController) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          perPage: pageSize.toString(),
          ...Object.fromEntries(
            Object.entries(debouncedFilters).filter(([_, value]) => value)
          ),
        });

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
        if (error.name !== 'AbortError') {
          console.error('Error fetching users:', error);
          toast.error('Error fetching user list');
          setUsers([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, debouncedFilters]
  );

  // Fetch users and departments
  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(abortController);

    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/list?perPage=all`);
        const result = await response.json();
        setDepartments(Array.isArray(result.data) ? result.data : result.data?.departments || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchDepartments();

    return () => abortController.abort();
  }, [fetchUsers]);

  const resetFilters = useCallback(() => {
    setFilters({ name: '', email: '', department: '', role: '', isActive: '' });
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const handleEditClick = useCallback(
    (user: User) => {
      router.push(`users/update/${user._id}`);
    },
    [router]
  );

  const changeStatus = useCallback(
    async (user: User) => {
      if (!user._id) return;

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('isActive', (!user.isActive).toString());
      formData.append('email', user.email);

      const promise = fetch(`/api/v1/admin/users/update/${user._id}`, {
        method: 'PATCH',
        body: formData,
      }).then(async res => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Update failed');
        }
        return result;
      });

      toast.promise(promise, {
        loading: 'Updating user...',
        success: result => result.success ? 'User updated successfully!' : null,
        error: err => err.message || 'Update failed',
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
    },
    [fetchUsers]
  );

  const handleDownloadExcel = useCallback(() => {
    const data = users.map((user, idx) => ({
      'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
      Name: user.name,
      Email: user.email,
      Role: user.role || 'User',
      Status: user.isActive ? 'Active' : 'Inactive',
      CreatedAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A',
      UpdatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(wb, `users_export_${timestamp}.xlsx`);
  }, [users, currentPage, pageSize]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }, []);
  useEffect(() => {
    const eligibleIds = users.filter(isUserEligible).map(u => u._id);

    setSelectAll(
      eligibleIds.length > 0 && eligibleIds.every(id => selectedUsers.includes(id))
    );
  }, [users, selectedUsers]);


  if (!isAuthorized) {
    return <UnauthorizedComponent />;
  }
  const handleDownload = (url: string | undefined) => {
    if (!url) {
      alert("Resume not found!");
      return;
    }

    try {
      // Create an invisible <a> tag and trigger the browser download
      const link = document.createElement("a");
      link.href = url;

      // Optional: extract filename from URL
      const fileName = url.split("/").pop() || "download";

      link.setAttribute("download", fileName);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const sendBulkMail = async (type: string) => {
    if (!type) return;
    if (selectedUsers.length === 0) {
      return toast.error("No users selected");
    }
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Send ${type} email to ${selectedUsers.length} selected users?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, send!",
    });

    if (confirm.isConfirmed) {
      try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email/send-bulk`, {
          method: "POST",
          body: JSON.stringify({ userIds: selectedUsers ,type:type}),
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Mail Sending in Background successfully!");
        } else {
          toast.error(result.message || "Failed to send mail");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error in Bulk mail");
      }
    }

  }
  const handleSelectUser = (id: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((uid) => uid !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);

    if (checked) {
      const eligibleIds = users
        .filter((u) => isUserEligible(u))
        .map((u) => u._id);

      setSelectedUsers(eligibleIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const isUserEligible = (user: User) => {
    return user.isActive === true && user.isVerified === true && user.isEmailVerified === true;
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
      {loading && <LoadingScreen />}

      <UserPermissionGuard action="read">
        <div className="flex flex-col gap-4 p-4">
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



              <div>

                <select
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm  "
                  disabled={selectedUsers.length === 0}
                  value=""
                  onChange={(e) => sendBulkMail(e.target.value)}
                >
                  <option value="">Send Mail to Selected ({selectedUsers.length})</option>
                  <option value="bulk_email_template">Broadcast</option>
                  <option value="warning_email_template">Warning</option>
                  <option value="registration_email_template">Registration Confirmation Email</option>
                </select>

              </div>
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
                    <Label htmlFor="department-filter">Department</Label>
                    <select
                      id="department-filter"
                      name="department"
                      value={filters.department}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="role-filter">Role</Label>
                    <select
                      id="role-filter"
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <select
                      id="status-filter"
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-400 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
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

          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Users per page:</Label>
            <select
              id="page-size"
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created/Updated</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Name (USER-ID)</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Department</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Email</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Role</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Status</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.length > 0 ? (
              users.map((user, index) => {
                // ✅ define menus properly outside JSX
                const menus = [
                  {
                    label: "Edit",
                    icon: Edit,
                    onClick: () => handleEditClick(user),
                    disabled: user.role === "super admin" || isSubmitting,
                  },
                ];

                if (user?.resume) {
                  menus.push({
                    label: "Download Resume",
                    icon: Download,
                    onClick: () => handleDownload(user.resume),
                  });
                }

                if (user?.avatar) {
                  menus.push({
                    label: "Download Photo",
                    icon: Download,
                    onClick: () => handleDownload(user.avatar),
                  });
                }

                return (
                  <TableRow key={user._id}>
                    <TableCell className="px-5 py-1">
                      <input
                        type="checkbox"
                        disabled={!isUserEligible(user)}
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => handleSelectUser(user._id, e.target.checked)}
                        className={`${!isUserEligible(user) ? "opacity-30 cursor-not-allowed" : ""}`}
                      />

                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"} <br />
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A"}
                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      {user.name} <br></br>
                      {user.emp_id}
                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize">
                        {user.department || "N/A"}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      <span
                        className={`${user.role === "user"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          } px-2 py-1 text-xs font-medium rounded-full capitalize`}
                      >
                        {user.role || "user"}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={user.isActive}
                          onChange={() => changeStatus(user)}
                          disabled={user.role === "super admin" || isSubmitting}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600" />
                      </label>
                    </TableCell>

                    {/* ✅ Pass the dynamically built menus here */}
                    <TableActions menuItems={menus} />
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  {loading ? "Loading users..." : "No users found"}
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
    </div>
  );
}