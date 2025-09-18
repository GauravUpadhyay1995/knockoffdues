'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FiArrowLeft,
    FiCalendar,
    FiUser,
    FiClock,
    FiEdit3,
    FiDownload,
    FiPaperclip,
    FiX,FiRefreshCw
    
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const TaskDetailPage = () => {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'comments' | 'activity'>('details');
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    // Move fetchTask to component scope so it can be used elsewhere
    const fetchTask = async () => {
        if (!id) return;

        const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
            method: "GET",
        }).then(async (res) => {
            const text = await res.text();
            const result = text ? JSON.parse(text) : {};
            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch task");
            }
            return result.data || {};
        });

        toast.promise(promise, {
            loading: "Fetching task...",
            success: "Task fetched successfully!",
            error: (err) => err.message || "Failed to fetch task",
        });

        try {
            const data = await promise;
            setTask({
                ...data,
                // fallback mock if API doesn’t return
                title: data.taskName || 'Website Redesign Project',
                description: data.description || 'Complete the redesign of the company website...',
                status: data.status || 'In Progress',
                priority: data.priority || 'High',
                startDate: data.startDate || '2023-10-15',
                endDate: data.endDate || '2023-11-20',
                assignedTo: data.assignedTo || [
                    { id: 1, name: 'Sarah Johnson' },
                    { id: 2, name: 'Michael Chen' }
                ],
                createdBy: data.createdBy || { id: 3, name: 'Alex Rivera' },
                attachments: data.attachments || [],
                comments: data.comments || [],
                progress: data.progress ?? 65,
                isActive: data.isActive ?? true,
            });
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast.error(error.message || "Failed to fetch task");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTask();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Task not found</h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const PriorityBadge = ({ priority }: { priority: string }) => {
        const priorityColors: Record<string, string> = {
            High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[priority] || ''}`}>
                {priority}
            </span>
        );
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const statusColors: Record<string, string> = {
            'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'On Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || ''}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors mb-4"
                    >
                        <FiArrowLeft className="mr-2" /> Back to Tasks
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
                            <div className="flex items-center mt-2 space-x-3">
                                <StatusBadge status={task.status} />
                                <PriorityBadge priority={task.priority} />
                                {task.isActive ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={fetchTask} className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <FiRefreshCw className="mr-2" /> Refresh</button>
                      
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex space-x-8">
                        {['details', 'attachments', 'comments', 'activity'].map((tab) => (
                            <button
                                key={tab}
                                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab(tab as any)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Task Details</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{task.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <FiCalendar className="text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                                            <p className="text-gray-900 dark:text-white">{new Date(task.startDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <FiClock className="text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                                            <p className="text-gray-900 dark:text-white">{new Date(task.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FiClock className="text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Last UpDate</p>
                                            <p className="text-gray-900 dark:text-white">{new Date(task.updatedAt).toLocaleDateString()} - <small> {task.updatedBy.name} ({task.updatedBy.email})</small></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">

                                    <div>
                                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2"><FiUser className='w-5 h-5 mr-2 flex items-center justify-center ' /> <span>Assigned To</span></p>
                                        <div className="space-y-2 ml-8">
                                            {task?.assignedTo && task?.assignedTo?.length > 0 ? (
                                                task.assignedTo.map((user: any) => (
                                                    <div
                                                        key={user._id}
                                                        className="flex items-center"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium mr-3">
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-gray-900 dark:text-white">
                                                            {user.name} <small>({user.email})</small>
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400">No users assigned.</p>
                                            )}
                                        </div>
                                    </div>


                                    <div>
                                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2"><FiUser className='w-5 h-5 mr-2 flex items-center justify-center ' /> <span>Created By</span></p>
                                        <div className="flex items-center ml-8">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3">
                                                {task.createdBy.name.charAt(0)}
                                            </div>
                                            <span className="text-gray-900 dark:text-white">{task.createdBy.name} - <small>({task.createdBy.email} )</small></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attachments Tab */}
                    {activeTab === 'attachments' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Attachments</h2>

                            {task.docs.length > 0 ? (
                                <div className="space-y-3">
                                    {task.docs.map((file: any) => (
                                        <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center">
                                                <FiPaperclip className="text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-gray-900 dark:text-white">
                                                        Attachment_{file._id}</p>

                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (file.url) {
                                                        const link = document.createElement("a");
                                                        link.href = file.url;
                                                        link.download = file.url.split("/").pop() || "file";
                                                        link.target = "_blank"; // open in new tab if browser blocks download
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }
                                                }}
                                                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                            >
                                                <FiDownload className="w-6 h-6" />
                                            </button>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No attachments yet.</p>
                            )}
                        </div>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Comments</h2>

                            {task.comments.length > 0 ? (
                                <div className="space-y-4">
                                    {task.comments.map((comment: any) => (
                                        <div key={comment.id} className="flex space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium flex-shrink-0">
                                                {comment.user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{comment.user.name}</h4>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{comment.date}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mt-1">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
                            )}

                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <textarea
                                    placeholder="Add a comment..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;
