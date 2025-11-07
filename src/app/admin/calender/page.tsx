// components/calendar/Calendar.tsx
'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Plus } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addHours,
  isBefore,
  startOfDay,
} from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import MainCalendarView from '@/components/calendar/MainCalendarView';
import EventModal from '@/components/calendar/EventModal';
import CategoryFilter from '@/components/calendar/CategoryFilter';
import { categories, getColorForCategory } from '@/utils/calendarUtils';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import DayView from '@/components/calendar/DayView';
import ListView from '@/components/calendar/ListView'

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
const [currentDate, setCurrentDate] = useState(new Date());
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
  const [isLoading, setLoading] = useState(false);

  // ... rest of the logic (fetchEvents, handlers, etc.)

  useEffect(() => {
    if (admin?.id) {
      setCurrentUserId(admin.id);
    }
  }, [admin]);

  const fetchEvents = useCallback(async () => {
    try {
      const [usersRes, meetingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=All&isActive=true&isVerified=true`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/calender/create`, { credentials: 'include' })
      ]);

      const [usersResult, meetingsResult] = await Promise.all([
        usersRes.json(),
        meetingsRes.json()
      ]);

      if (usersResult.success && usersResult.data) {
        setAssignedByUserList(usersResult.data.customers || []);
      }

      if (meetingsResult && Array.isArray(meetingsResult)) {
        const normalized = meetingsResult.map((m: any) => ({
          id: m._id,
          title: m.title,
          description: m.description ?? '',
          start: new Date(m.start),
          end: new Date(m.end),
          creator: m.creator?._id || '',
          attendees: (m.attendees || []).map((a: any) => a._id),
          category: m.category ?? 'Meeting',
          color: getColorForCategory(m.category ?? 'Meeting'),
        }));
        setEvents(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchEvents();
    }
  }, [currentUserId, fetchEvents]);


  const handleDragStart = useCallback((e: React.DragEvent, meeting: Meeting) => {
    if (meeting.creator === currentUserId) {
      setDraggedEvent(meeting);
      setIsDragging(true);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', meeting.id || '');
    } else {
      e.preventDefault();
    }
  }, [currentUserId]);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedEvent) return;

    const newStartDate = startOfDay(targetDate);
    const today = startOfDay(new Date());

    if (isBefore(newStartDate, today)) {
      alert('Cannot schedule events in the past');
      return;
    }

    const originalStart = new Date(draggedEvent.start);
    const originalEnd = new Date(draggedEvent.end);

    const newStart = new Date(newStartDate.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds()));
    const newEnd = new Date(newStartDate.setHours(originalEnd.getHours(), originalEnd.getMinutes(), originalEnd.getSeconds()));

    if (isBefore(newEnd, newStart)) {
      const originalDuration = originalEnd.getTime() - originalStart.getTime();
      newEnd.setTime(newStart.getTime() + originalDuration);
    }

    try {
      const updatedEvent = {
        ...draggedEvent,
        start: newStart,
        end: newEnd,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calender/update/${draggedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
        credentials: 'include'
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        console.error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, [draggedEvent, fetchEvents]);

  const visibleMeetings = useMemo(() => {
    return events.filter(meeting =>
      (meeting.creator === currentUserId || meeting.attendees.includes(currentUserId)) &&
      filteredCategories.includes(meeting.category)
    );
  }, [events, currentUserId, filteredCategories]);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDay(day);
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(addMonths(currentDate, 1));
  }, [currentDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(subMonths(currentDate, 1));
  }, [currentDate]);

  const handleAddEvent = useCallback(() => {
    const defaultStart = addHours(startOfDay(selectedDay), 9);
    setNewEvent({ id: null, title: '', description: '', attendees: [], category: 'Meeting', start: defaultStart, end: addHours(defaultStart, 1) });
    setIsModalOpen(true);
  }, [selectedDay]);

  const handleEditEvent = useCallback((meeting: Meeting) => {
    setNewEvent({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      attendees: meeting.attendees,
      category: meeting.category,
      start: new Date(meeting.start),
      end: new Date(meeting.end),
    });
    setIsModalOpen(true);
  }, []);
  const handleDeleteEvent = useCallback(async (meeting: Meeting) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the event: "${meeting.title}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calender/update/${meeting.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (res.ok) {
          await fetchEvents();
          Swal.fire(
            'Deleted!',
            'Your event has been deleted.',
            'success'
          );
        } else {
          console.error('Failed to delete event');
          Swal.fire(
            'Failed!',
            'Could not delete the event. Please try again.',
            'error'
          );
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        Swal.fire(
          'Error!',
          'An error occurred while deleting the event.',
          'error'
        );
      }
    }
  }, [fetchEvents]);

  useEffect(() => {
    const handleHoverCardPosition = () => {
      const hoverCards = document.querySelectorAll('.hover-card');

      hoverCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        card.classList.remove('right-0', 'bottom-full', 'left-0', 'top-full');
        card.classList.add('top-full', 'left-0');

        if (rect.right > viewportWidth - 20) {
          card.classList.remove('left-0');
          card.classList.add('right-0');
        }

        if (rect.bottom > viewportHeight - 20) {
          card.classList.remove('top-full');
          card.classList.add('bottom-full');
        }

        if (rect.right > viewportWidth - 20 && rect.bottom > viewportHeight - 20) {
          card.classList.remove('left-0', 'top-full');
          card.classList.add('right-0', 'bottom-full');
        }
      });
    };

    const eventElements = document.querySelectorAll('.group\\/event');
    eventElements.forEach(element => {
      element.addEventListener('mouseenter', handleHoverCardPosition);
    });

    window.addEventListener('resize', handleHoverCardPosition);
    window.addEventListener('scroll', handleHoverCardPosition);

    return () => {
      eventElements.forEach(element => {
        element.removeEventListener('mouseenter', handleHoverCardPosition);
      });
      window.removeEventListener('resize', handleHoverCardPosition);
      window.removeEventListener('scroll', handleHoverCardPosition);
    };
  }, [visibleMeetings]);

  const handleModalSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    const start = new Date(newEvent.start);
    const end = new Date(newEvent.end);
    const isEditing = !!newEvent.id;
    const now = new Date();

    if (isBefore(start, now) && !isEditing) {
      alert('Cannot schedule new events in the past');
      return;
    }

    const meetingData = {
      title: newEvent.title,
      description: newEvent.description || '',
      start,
      end,
      creator: currentUserId,
      attendees: newEvent.attendees,
      category: newEvent.category,
      color: getColorForCategory(newEvent.category),
    };

    if (newEvent.id) {
      Object.assign(meetingData, { id: newEvent.id });
    }

    try {
      const method = newEvent.id ? 'PUT' : 'POST';
      const url = newEvent.id ? `${process.env.NEXT_PUBLIC_API_URL}/calender/update/${newEvent.id}` : `${process.env.NEXT_PUBLIC_API_URL}/calender/create`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to save event');
      await fetchEvents();
      setIsModalOpen(false);
      setNewEvent({ id: null, title: '', description: '', attendees: [], category: 'Meeting', start: new Date(), end: addHours(new Date(), 1) });
      setLoading(false)
    } catch (error) {
      console.error('Error saving event:', error);
      setLoading(false)

    }
  }, [newEvent, currentUserId, fetchEvents]);

  const handleAttendeeChange = useCallback((attendees: string[]) => {
    setNewEvent(prev => ({ ...prev, attendees }));
  }, []);

  const toggleCategoryFilter = useCallback((category: string) => {
    setFilteredCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const getMonthDays = useMemo(() => {
    const startOfThisMonth = startOfMonth(currentDate);
    const endOfThisMonth = endOfMonth(currentDate);
    const startOfCalendar = startOfWeek(startOfThisMonth);
    const endOfCalendar = endOfWeek(endOfThisMonth);
    return eachDayOfInterval({ start: startOfCalendar, end: endOfCalendar });
  }, [currentDate]);

  const getWeekDays = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(currentDate);
    return eachDayOfInterval({ start: startOfCurrentWeek, end: endOfWeek(startOfCurrentWeek) });
  }, [currentDate]);


  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white dark:text-gray-100 text-gray-700 font-inter flex flex-col ">
      <div className="mx-auto w-full flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[calc(100vh-1rem)]">
        <aside className="w-full lg:w-114 border border-gray-200 bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col space-y-6 shadow-lg">
          <button
            onClick={handleAddEvent}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Event</span>
          </button>

          <MiniCalendar
            currentDate={currentDate}
            selectedDay={selectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDayClick={handleDayClick}
          />

          <CategoryFilter
            categories={categories}
            filteredCategories={filteredCategories}
            onToggleCategory={toggleCategoryFilter}
            onToggleAll={() => setFilteredCategories(
              filteredCategories.length === categories.length ? [] : categories
            )}
          />
        </aside>

        <main className="flex-grow border border-gray-200 bg-white dark:bg-gray-800 rounded-lg p-1 sm:p-3 flex flex-col shadow-lg text-gray-700 dark:text-gray-100">
          <CalendarHeader
            currentDate={currentDate}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            view={view}
            onViewChange={setView}
            reloadData={fetchEvents}
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
          {view === 'Day' && (
            <DayView
              selectedDay={selectedDay}
              visibleMeetings={visibleMeetings}
              currentUserId={currentUserId}
              assignedByUserList={assignedByUserList}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              isDragging={isDragging}
            />
          )}
          {view === 'List' && (
            <ListView
              visibleMeetings={visibleMeetings}
              currentUserId={currentUserId}
              assignedByUserList={assignedByUserList}
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
        isLoading={isLoading}
      />
    </div>
  );
};

export default Calendar;