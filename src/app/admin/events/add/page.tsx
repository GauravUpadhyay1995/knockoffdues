'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';
import FileInput from '@/components/form/input/FileInput';
import { toast } from 'react-hot-toast';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLoading } from '@/context/LoadingContext';
import ImageGallery from '@/components/ui/images/ImageGallery';

export default function AddEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isLoading, setIsLoading } = useLoading();

  const [title, setTitle] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string, id: string }[]>([]);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [editorKey, setEditorKey] = useState(0);

  // Helper: format date to "YYYY-MM-DDTHH:mm"
  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16); // keep up to minutes
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/v1/admin/events/${id}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          const result = await res.json();
          if (result.success) {
            const data = result.data;
            setTitle(data.title || '');
            setExistingImages(
              data.images?.map((img: any) => ({
                url: img.url,
                id: img._id,
              })) || []
            );
            setStartDate(data.startDate ? formatDateTimeLocal(data.startDate) : '');
            setEndDate(data.endDate ? formatDateTimeLocal(data.endDate) : '');
            setVenue(data.venue ? data.venue : '');
            setDescription(data.description ? data.description : '');
          } else {
            toast.error('Failed to fetch event data');
          }
        } catch (error) {
          toast.error('Error fetching event data');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setTitle('');
      setExistingImages([]);
      setStartDate('');
      setEndDate('');
      setVenue('');
      setDescription('');
      setEditorKey(prev => prev + 1);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    images.forEach(img => formData.append('images', img));

    const isoStartDate = new Date(startDate).toISOString();
    formData.append('startDate', isoStartDate);

    const isoEndDate = new Date(endDate).toISOString();
    formData.append('endDate', isoEndDate);

    formData.append('venue', venue);
    formData.append('description', description);

    const url = id ? `/api/v1/admin/events/update/${id}` : `/api/v1/admin/events/create`;
    const method = id ? 'PATCH' : 'POST';

    const promise = fetch(url, {
      method,
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Submission failed');
      }
      return result;
    });

    toast.promise(
      promise,
      {
        loading: id ? 'Updating event...' : 'Creating event...',
        success: () => {
          setImages([]);
          router.push('/admin/events');
          return id ? 'Event updated successfully!' : 'Event created successfully!';
        },
        error: (err) => err.message || 'Something went wrong',
      },
      {
        position: 'top-center',
        style: {
          minWidth: '250px',
          transform: 'translateX(0) translateY(0)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        className: 'toast-center',
      }
    );
  };

  const handleImageDelete = async (fileId: string) => {
    if (!id) {
      toast.error('Gallery ID is missing');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/admin/events/update/${id}/image/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      setImages([]);
      setIsLoading(false);
      return result;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to delete image');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={id ? 'Edit Event' : 'Add Event'} />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Event Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Event Venue"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Event Start Date & Time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event End Date & Time
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Event End Date & Time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
            <div className="flex items-center gap-4 flex-wrap">
              <FileInput
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                required={!id}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
          <div className="flex items-center gap-4 flex-wrap">
            <ImageGallery
              existingImages={existingImages}
              setExistingImages={setExistingImages}
              onDeleteImage={handleImageDelete}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <SummernoteEditor
            key={editorKey}
            value={description}
            onChange={setDescription}
            height={300}
            fullWidth
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition"
          >
            {isLoading ? 'Saving...' : id ? 'Update Event' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
