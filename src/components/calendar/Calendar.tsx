// components/calendar/Calendar.tsx
'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Plus } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  addHours,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import CalendarHeader from './CalendarHeader';
import MainCalendarView from './MainCalendarView';
import EventModal from './EventModal';
import CategoryFilter from './CategoryFilter';
import { categories, getColorForCategory } from '@/utils/calendarUtils';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Meeting {
  id: string | null;
  title: string;
  description: string;
  attendees: string[];
  category: string;
  start: Date | string;
  end: Date | string;
  creator?: string;
  color?: string;
}

const Calendar: React.FC = () => {
  const { admin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState('Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Meeting>({
    id: null,
    title: '',
    description: '',
    attendees: [],
    category: 'Meeting',
    start: new Date(),
    end: addHours(new Date(), 1),
  });
  const [filteredCategories, setFilteredCategories] = useState<string[]>(categories);
  const [currentUserId, setCurrentUserId] = useState(admin?.id);
  const [events, setEvents] = useState<Meeting[]>([]);
  const [assignedByUserList, setAssignedByUserList] = useState<User[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<Meeting | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ... rest of the logic (fetchEvents, handlers, etc.)

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white dark:text-gray-100 text-gray-700 font-inter flex flex-col p-2 sm:p-4 lg:p-8">
      <div className="mx-auto w-full flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[calc(100vh-1rem)]">
        <aside className="w-full text-gray-700 dark:text-gray-100 lg:w-84 border border-gray-200 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 flex flex-col space-y-4 lg:space-y-6 shadow-lg">
          <button
            onClick={handleAddEvent}
            className="flex items-center justify-center space-x-2 bg-indigo-600 dark:text-gray-100 text-gray-700 p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <Plus className="dark:text-gray-100 text-white" size={20} />
            <span className="dark:text-gray-100 text-white">Add Event</span>
          </button>
          
          {/* Mini Calendar */}
          <div className="flex-shrink-0">
            {/* ... mini calendar implementation */}
          </div>

          <CategoryFilter
            categories={categories}
            filteredCategories={filteredCategories}
            onToggleCategory={toggleCategoryFilter}
            onToggleAll={() => setFilteredCategories(filteredCategories.length === categories.length ? [] : categories)}
          />
        </aside>

        <main className="flex-grow border border-gray-200 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 flex flex-col shadow-lg text-gray-700 dark:text-gray-100">
          <CalendarHeader
            currentDate={currentDate}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            view={view}
            onViewChange={setView}
          />

          {view === 'Month' && (
            <MainCalendarView
              currentDate={currentDate}
              visibleMeetings={visibleMeetings}
              isDragging={isDragging}
              draggedEvent={draggedEvent}
              currentUserId={currentUserId}
              assignedByUserList={assignedByUserList}
              onDayClick={handleDayClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {/* Other views can be implemented similarly */}
        </main>
      </div>

      <EventModal
        isOpen={isModalOpen}
        isEditing={!!newEvent.id}
        event={newEvent}
        assignedByUserList={assignedByUserList}
        currentUserId={currentUserId}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        onEventChange={(field, value) => setNewEvent({ ...newEvent, [field]: value })}
        onAttendeeChange={handleAttendeeChange}
      />
    </div>
  );
};

export default Calendar;