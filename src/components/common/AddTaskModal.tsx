'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiPlus, FiUpload, FiChevronDown, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

// Custom multi-select dropdown component
interface MultiSelectDropdownProps {
  options: User[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select users" }: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (userId: string) => {
    if (selected.includes(userId)) {
      onChange(selected.filter(id => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  const getSelectedNames = () => {
    if (selected.length === 0) return placeholder;

    return options
      .filter(user => selected.includes(user._id))
      .map(user => user.name)
      .join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : ''}`}>
          {getSelectedNames()}
        </span>
        <FiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
          <div className="py-1">
            {options.map(user => (
              <div
                key={user._id}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                onClick={() => toggleOption(user._id)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-2 ${selected.includes(user._id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {selected.includes(user._id) && <FiCheck className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
            ))}

            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No users available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AddTaskModal({ isOpen, onClose, onTaskAdded }: AddTaskModalProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    startDate: '',
    endDate: '',
    assignedTo: [] as string[],
  });
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Trim all string values for proper validation
    const trimmedTaskName = formData.taskName.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTaskName) {
      newErrors.taskName = "Task name is required .";
    }

    if (!trimmedDescription) {
      newErrors.description = "Description is required .";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required .";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required .";
    }

    // Only validate date comparison if both dates exist
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "End date must be after start date.";

    }

    setErrors(newErrors);

    // Return true if no errors (form is valid)
    return Object.keys(newErrors).length === 0;
  };

  // Fetch users when modal opens to assign tasks
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=All&isActive=true`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.customers) {
          setUsers(result.data.customers);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleClose = () => {
    setFormData({
      taskName: '',
      description: '',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      assignedTo: [],
    });
    setErrors({});
    setFiles([]);
    onClose();
  };

  useEffect(() => {
    const newErrors = { ...errors };
    let hasChanges = false;

    // Clear taskName error if fixed
    if (formData.taskName && newErrors.taskName) {
      delete newErrors.taskName;
      hasChanges = true;
    }

    // Clear description error if fixed
    if (formData.description && newErrors.description) {
      delete newErrors.description;
      hasChanges = true;
    }

    // For date fields, we need to revalidate after clearing
    if (formData.startDate && newErrors.startDate && newErrors.startDate !== "End date must be after start date.") {
      delete newErrors.startDate;
      hasChanges = true;
    }

    if (formData.endDate && newErrors.endDate && newErrors.endDate !== "End date must be after start date.") {
      delete newErrors.endDate;
      hasChanges = true;
    }

    // Revalidate date comparison if both dates exist
    if (formData.startDate && formData.endDate) {
      if (formData.startDate > formData.endDate) {
        if (newErrors.endDate !== "End date must be after start date.") {
          newErrors.endDate = "End date must be after start date.";
          hasChanges = true;
        }
      } else if (newErrors.endDate === "End date must be after start date.") {
        delete newErrors.endDate;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [formData, errors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignedToChange = (selected: string[]) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: selected
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    console.log('Should submit?', isValid);

    if (!isValid) {
      console.log('Form validation failed, stopping submission');
      return; // This is crucial!
    }
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("taskName", formData.taskName);
      submitData.append("description", formData.description);
      submitData.append("startDate", formData.startDate);
      submitData.append("endDate", formData.endDate);
      submitData.append("priority", formData.priority);

      // Append assignedTo as array
      formData.assignedTo.forEach((id) => submitData.append("assignedTo[]", id));

      // Append files
      files.forEach((file) => submitData.append("docs", file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/create`, {
        method: "POST",
        body: submitData,
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Task created successfully!");
        onTaskAdded();
        handleClose();
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error creating task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-Medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  <span>Add New Task</span>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FiX className="h-6 w-6 text-orange-600 hover:text-orange-700" />

                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Task *
                      </label>
                      <input
                        type="text"
                        id="taskName"
                        name="taskName"
                        value={formData.taskName}
                        onChange={handleChange}
                        className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out
                            ${errors.taskName
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                          } text-gray-900 dark:text-white`}
                      />
                      {errors.taskName && <p className="text-red-700 text-sm mt-1">{errors.taskName}</p>}
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                        Priority *
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}

                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>

                    </div>

                    <div>
                      <label className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                        Assign To
                      </label>
                      <MultiSelectDropdown
                        options={users}
                        selected={formData.assignedTo}
                        onChange={handleAssignedToChange}
                        placeholder="Select users to assign"
                      />

                    </div>

                    {/* Start Date Field */}
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out
                            ${errors.startDate
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                          } text-gray-900 dark:text-white`}
                      />
                      {errors.startDate && <p className="text-red-700 text-sm mt-1">{errors.startDate}</p>}
                    </div>

                    {/* End Date Field */}
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                        End Date *
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out
                            ${errors.endDate
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                          } text-gray-900 dark:text-white`}
                      />
                      {errors.endDate && <p className="text-red-700 text-sm mt-1">{errors.endDate}</p>}
                    </div>


                    <div>
                      <label htmlFor="docs" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                        Attachments
                      </label>
                      <input
                        type="file"
                        multiple
                        id="docs"
                        name="docs"
                        onChange={handleFileChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      />


                    </div>

                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out
                            ${errors.description
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                          : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                        } text-gray-900 dark:text-white`}
                    />
                    {errors.description && <p className="text-red-700 text-sm mt-1">{errors.description}</p>}
                  </div>

                  {files.length > 0 && (
                    <div className="mt-2">
                      <hr className='mt-10 mb-10'></hr>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected files:</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400">
                        {files.map((file, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-700 hover:text-red-700"
                            >
                              <FiX className="h-6 w-6 text-orange-600 hover:text-orange-700" />

                            </button>
                          </li>
                        ))}
                        <hr className='mt-10'></hr>
                      </ul>
                    </div>
                  )}
                  <div className="mt-6 flex justify-end space-x-3">

                    <Button
                      type="submit"

                      disabled={loading}
                      className="flex items-center gap-2  bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <FiPlus className="w-4 h-4" />
                          Create Task
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}