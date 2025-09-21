// components/calendar/EventModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import Label from '@/components/form/Label';
import MultiSelectDropdown from '@/components/calendar/MultiSelectDropdown'

interface EventModalProps {
  isOpen: boolean;
  isEditing: boolean;
  event: any;
  assignedByUserList: any[];
  currentUserId: string;
  categories: string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onEventChange: (field: string, value: any) => void;
  onAttendeeChange: (attendees: string[]) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  isEditing,
  event,
  assignedByUserList,
  currentUserId,
  categories,
  onClose,
  onSubmit,
  onEventChange,
  onAttendeeChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold dark:text-gray-100 text-gray-700 mb-6">
          {isEditing ? 'Edit Scheduler' : 'Add New Scheduler'}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-gray-100" htmlFor="title">
                Title
              </Label>
              <input
                id="title"
                type="text"
                value={event.title}
                onChange={(e) => onEventChange('title', e.target.value)}
                className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <Label className="text-gray-100" htmlFor="start">
                Start
              </Label>
              <input
                id="start"
                type="datetime-local"
                value={format(new Date(event.start), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => onEventChange('start', new Date(e.target.value))}
                className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <Label className="text-gray-100" htmlFor="end">
                End
              </Label>
              <input
                id="end"
                type="datetime-local"
                value={format(new Date(event.end), "yyyy-MM-dd'T'HH:mm")}
                min={format(new Date(event.start), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => onEventChange('end', new Date(e.target.value))}
                className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <Label className="text-gray-100" htmlFor="category">
                Category
              </Label>
              <select
                id="category"
                value={event.category}
                onChange={(e) => onEventChange('category', e.target.value)}
                className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-100" htmlFor="attendees">
                Assign To
              </Label>
              <MultiSelectDropdown
                options={assignedByUserList.filter((u) => u._id !== currentUserId)}
                selected={event.attendees}
                onChange={onAttendeeChange}
                placeholder="Select users to assign"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-100" htmlFor="description">
              Description
            </Label>
            <textarea
              id="description"
              value={event.description}
              onChange={(e) => onEventChange('description', e.target.value)}
              className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 dark:text-gray-100 text-gray-700 p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isEditing ? 'Update Event' : 'Save Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventModal;