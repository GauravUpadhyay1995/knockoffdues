'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCalendar, FiUser, FiClock, FiDownload, FiPaperclip, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Attachment {
  _id: string;
  url: string;
}

interface Comment {
  _id: string;
  description: string;
  createdBy: User;
  createdAt: string | Date;
  docs: Attachment[];
}

interface Task {
  _id: string;
  taskName: string;
  description: string;
  stage: 'Pending' | 'InProgress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  isActive: boolean;
  startDate: string | Date;
  endDate: string | Date;
  progress: number;
  assignedTo: User[];
  createdBy: User;
  updatedBy: User;
  updatedAt: string | Date;
  docs: Attachment[];
  subTasks: Comment[];
}

const PriorityBadge = memo(({ priority }: { priority: string }) => {
  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[priority] || ''}`}>
      {priority}
    </span>
  );
});
PriorityBadge.displayName = 'PriorityBadge';

const StatusBadge = memo(({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    InProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || ''}`}>
      {status}
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

const TaskDetailPage = () => {
  const [task, setTask] = useState<Task | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'comments'>('details');
  const [commentTab, setCommentTab] = useState<'submit' | 'history'>('history');

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  const validateFiles = useCallback((files: File[]): { validFiles: File[]; invalidFiles: string[] } => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of Array.from(files)) {
      if (allowedFileTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    return { validFiles, invalidFiles };
  }, []);

  const fetchTask = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch task');
      }

      setTask({
        _id: result.data._id,
        taskName: result.data.taskName,
        description: result.data.description,
        stage: result.data.stage,
        priority: result.data.priority,
        isActive: result.data.isActive ?? true,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        progress: result.data.progress ?? 65,
        assignedTo: result.data.assignedTo || [],
        createdBy: result.data.createdBy,
        updatedBy: result.data.updatedBy,
        updatedAt: result.data.updatedAt,
        docs: result.data.docs || [],
        subTasks: result.data.subTasks || [],
      });
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;

      const { validFiles, invalidFiles } = validateFiles(selectedFiles);
      setFiles(validFiles);

      if (invalidFiles.length > 0) {
        toast.error(`Invalid files: ${invalidFiles.join(', ')}. Only PDF and images are allowed.`);
      }
    },
    [validateFiles]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;

      const { invalidFiles } = validateFiles(files);
      if (invalidFiles.length > 0) {
        toast.error(`Please remove invalid files: ${invalidFiles.join(', ')}`);
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append('description', description);
      files.forEach(file => formData.append('docs', file));

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/subtask/create/${id}`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to post comment');
        }

        setDescription('');
        setFiles([]);
        await fetchTask();
        toast.success('Comment posted successfully!');
      } catch (error: any) {
        console.error('Error posting comment:', error);
        toast.error(error.message || 'Failed to post comment');
      } finally {
        setLoading(false);
      }
    },
    [id, description, files, fetchTask, validateFiles]
  );

  const handleDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop() || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Tasks
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.taskName}</h1>
            <div className="flex items-center mt-2 space-x-3">
              <StatusBadge status={task.stage} />
              <PriorityBadge priority={task.priority} />
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {task.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={fetchTask}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
        </div>

        <div className=" mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {(['details', 'attachments', 'comments'] as const).map(tab => (
              <button
                key={tab}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Update</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(task.updatedAt).toLocaleDateString()} - <small>{task.updatedBy.name} ({task.updatedBy.email})</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <FiUser className="w-5 h-5 mr-2" /> <span>Assigned To</span>
                    </p>
                    <div className="space-y-2 ml-8">
                      {task.assignedTo.length > 0 ? (
                        task.assignedTo.map(user => (
                          <div key={user._id} className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium mr-3">
                              {user.name.charAt(0)}
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
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <FiUser className="w-5 h-5 mr-2" /> <span>Created By</span>
                    </p>
                    <div className="flex items-center ml-8">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3">
                        {task.createdBy.name.charAt(0)}
                      </div>
                      <span className="text-gray-900 dark:text-white">
                        {task.createdBy.name} <small>({task.createdBy.email})</small>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Attachments</h2>
              {task.docs.length > 0 ? (
                <div className="space-y-3">
                  {task.docs.map(file => (
                    <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center">
                        <FiPaperclip className="text-gray-400 mr-3" />
                        <p className="text-gray-900 dark:text-white">{file.url.split('/').pop() || `Attachment_${file._id}`}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(file.url, `Attachment_${file._id}`)}
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

          {activeTab === 'comments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Comments</h2>
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-6">
                  {(['history', 'submit'] as const).map(tab => (
                    <button
                      key={tab}
                      className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                        commentTab === tab
                          ? 'border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      onClick={() => setCommentTab(tab)}
                    >
                      {tab === 'submit' ? 'Add Comment' : 'History'}
                    </button>
                  ))}
                </nav>
              </div>

              {commentTab === 'submit' && (
                <form onSubmit={handleSubmit}>
                  <label className="block mb-4 dark:text-gray-100 text-gray-900">
                    Attach Documents (PDF & Images only)
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
                      onChange={handleFileChange}
                      className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Allowed formats: PDF, JPG, JPEG, PNG, GIF, WEBP (Max size: 10MB each)
                    </p>
                  </label>

                  {files.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected files ({files.length}):
                      </p>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">{file.name}</span>
                            <span className="text-green-600 dark:text-green-400 text-xs">✓ Valid</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    placeholder="Add a comment..."
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}

              {commentTab === 'history' && (
                <div className="space-y-6">
                  {task.subTasks.length > 0 ? (
                    task.subTasks.map(comment => (
                      <div key={comment._id} className="group relative">
                        <div className="absolute left-5 top-11 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 group-last:hidden" />
                        <div className="flex space-x-4 relative">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 flex items-center justify-center text-orange-600 dark:text-orange-300 font-medium shadow-sm border-2 border-white dark:border-gray-800">
                              {comment.createdBy.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{comment.createdBy.name}</h4>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                  {comment.createdBy.role || 'User'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{comment.description}</p>
                            {comment.docs.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-2 mb-3">
                                  <FiPaperclip className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Attachments ({comment.docs.length})
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {comment.docs.map((doc, index) => (
                                    <button
                                      key={doc._id}
                                      onClick={() => handleDownload(doc.url, `Document_${index + 1}`)}
                                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-600 hover:border-orange-200 dark:hover:border-orange-700 transition-all duration-200 group/item"
                                    >
                                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center text-orange-600 dark:text-orange-400 border">
                                        <FiPaperclip className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                          {doc.url.split('/').pop() || `Document_${index + 1}`}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Click to download</p>
                                      </div>
                                      <FiDownload className="w-4 h-4 text-gray-400 group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <FiPaperclip className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Be the first to start the conversation. Share your thoughts and updates about this task.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;