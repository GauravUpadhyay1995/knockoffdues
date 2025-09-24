'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiPlus, FiUpload, FiChevronDown, FiCheck, FiEdit } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import { sub } from 'date-fns';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskUpdated: () => void;
    task: any; // The task data to edit
}

interface User {
    _id: string;
    name: string;
    email: string;
}

// Reuse the MultiSelectDropdown component from AddTaskModal
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

export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task }: EditTaskModalProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [users, setUsers] = useState<User[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [existingDocs, setExistingDocs] = useState<any[]>([]);
    const [docsToRemove, setDocsToRemove] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        taskName: '',
        description: '',
        priority: 'Medium' as 'Low' | 'Medium' | 'High',
        startDate: '',
        endDate: '',
        stage: 'Pending' as 'Pending' | 'InProgress' | 'Completed',
        assignedTo: [] as string[],
    });

    // Fetch users when modal opens and populate form with task data
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=All&isActive=true&isVerified=true`, {
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
        if (isOpen && task) {
            fetchUsers();
            // Pre-fill form with task data
            setFormData({
                taskName: task.taskName || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                stage: task.stage || 'Pending',
                startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
                endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
                assignedTo: task.assignedTo ? task.assignedTo.map((user: any) => user._id || user) : [],
            });
            setExistingDocs(task.docs || []);
            setDocsToRemove([]);
            setFiles([]);
        }
    }, [isOpen, task]);

    const handleClose = () => {
        setFormData({
            taskName: '',
            description: '',
            priority: 'Medium',
            stage: 'Pending',
            startDate: '',
            endDate: '',
            assignedTo: [],
        });
        setFiles([]);
        setExistingDocs([]);
        setDocsToRemove([]);
        onClose();
    };

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

    const removeExistingDoc = (docUrl: string) => {
        setDocsToRemove(prev => [...prev, docUrl]);
        setExistingDocs(prev => prev.filter(doc => doc.url !== docUrl));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Trim all string values for proper validation
        const trimmedTaskName = formData.taskName.trim();
        const trimmedDescription = formData.description.trim();

        if (!trimmedTaskName) {
            newErrors.taskName = "Task name is Mandatory  .";
        }

        if (!trimmedDescription) {
            newErrors.description = "Description is Mandatory  .";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is Mandatory  .";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is Mandatory  .";
        }

        // Only validate date comparison if both dates exist
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = "End date must be after start date.";

        }

        setErrors(newErrors);

        // Return true if no errors (form is valid)
        return Object.keys(newErrors).length === 0;
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
            submitData.append("stage", formData.stage);
            // Append assignedTo as array
            formData.assignedTo.forEach((id) => submitData.append("assignedTo[]", id));

            // Append files to upload
            files.forEach((file) => submitData.append("docs", file));

            // Append documents to remove
            if (docsToRemove.length > 0) {
                submitData.append("removeDocs", docsToRemove.join(','));
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/update/${task._id}`, {
                method: "PUT",
                body: submitData,
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Task updated successfully!");
                onTaskUpdated();
                handleClose();
            } else {
                toast.error(data.message || "Something went wrong!");
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Error updating task: " + error.message);
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
                                    <span>Edit Task</span>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <FiX className="h-6 w-6 text-orange-600 hover:text-orange-700" />
                                    </button>
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div >
                                            <label htmlFor="taskName" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                                                Task *
                                            </label>
                                            <input
                                                type="text"
                                                id="taskName"
                                                name="taskName"
                                                value={formData.taskName}
                                                onChange={handleChange}

                                                className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out ${errors.taskName
                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                                                    : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                                                    } text-gray-900 dark:text-white`}
                                            />
                                            {errors.taskName && <p className="text-red-700 text-sm mt-1">{errors.taskName}</p>}

                                        </div>
                                        <div>
                                            <label htmlFor="priority" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                                                Priority
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

                                                className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out ${errors.startDate
                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                                                    : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                                                    } text-gray-900 dark:text-white`}
                                            />
                                            {errors.startDate && <p className="text-red-700 text-sm mt-1">{errors.startDate}</p>}
                                        </div>

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

                                                className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out ${errors.endDate
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
                                    <div className="grid md:grid-cols-6 gap-4">
                                        {/* Status - 1/4 (25%) */}
                                        <div className='col-span-2'>
                                            <label htmlFor="stage" className="block text-sm font-Medium text-gray-700 dark:text-gray-300">
                                                Stage
                                            </label>
                                            <select
                                                id="stage"
                                                name="stage"
                                                value={formData.stage}
                                                onChange={handleChange}

                                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="InProgress">InProgress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>

                                        {/* Description - 3/4 (75%) */}
                                        <div className="col-span-4">
                                            <label
                                                htmlFor="description"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Description *
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={Math.max(1, Math.ceil(formData.description.length / 80))}

                                                className={`w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-300 ease-in-out ${errors.description
                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 pr-10"
                                                    : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700"
                                                    } text-gray-900 dark:text-white`}
                                            />
                                            {errors.description && <p className="text-red-700 text-sm mt-1">{errors.description}</p>}

                                        </div>
                                    </div>


                                    <div>


                                        {/* Existing documents */}
                                        {existingDocs.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Existing files:</p>
                                                <ul className="text-sm text-gray-600 dark:text-gray-400">
                                                    {existingDocs.map((doc, index) => (
                                                        <li key={index} className="flex justify-between items-center">
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-700 truncate max-w-xs"
                                                            >
                                                                {doc.url.split('/').pop()}
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingDoc(doc.url)}
                                                                className="text-red-500 hover:text-red-700 ml-2"
                                                            >
                                                                <FiX className="w-6 h-6 " />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <hr className='mt-10'></hr>
                                            </div>

                                        )}

                                        {/* New files to upload */}
                                        {files.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">New files to upload:</p>
                                                <ul className="text-sm text-gray-600 dark:text-gray-400">
                                                    {files.map((file, index) => (
                                                        <li key={index} className="flex justify-between items-center">
                                                            <span>{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <FiX className="w-6 h-6 " />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <hr className='mt-10'></hr>
                                            </div>
                                        )}
                                    </div>



                                    <div className="mt-6 flex justify-end space-x-3">

                                        <Button
                                            type="submit"

                                            disabled={loading}
                                            className="flex items-center gap-2  bg-orange-600 hover:bg-orange-700 text-white"

                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <FiEdit className="w-4 h-4" />
                                                    Update Task
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