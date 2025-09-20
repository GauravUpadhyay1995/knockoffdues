'use client'
import Swal from 'sweetalert2';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Label from "@/components/form/Label";
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Plus, Pencil, X, GripVertical } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek, eachWeekOfInterval, addDays, getDay, startOfDay, endOfDay, addHours, isAfter, isBefore } from 'date-fns';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
const categories = ['Meeting', 'Task', 'Event', 'Birthday', 'Followup'];

const getColorForCategory = (cat: string): string => {
  const colors: { [key: string]: string } = {
    Meeting: 'bg-red-300 text-red-800 dark:bg-red-900 dark:text-red-100',
    Task: 'bg-blue-300 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    Event: 'bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-100',
    Birthday: 'bg-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    Followup: 'bg-gray-300 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  };
  return colors[cat] || 'bg-gray-300 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
};

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

interface MultiSelectDropdownProps {
  options: User[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown = React.memo(({ options, selected, onChange, placeholder = "Select users" }: MultiSelectDropdownProps) => {
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

  const toggleOption = useCallback((userId: string) => {
    if (selected.includes(userId)) {
      onChange(selected.filter(id => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  }, [selected, onChange]);

  const getSelectedNames = useMemo(() => {
    if (selected.length === 0) return placeholder;
    return options
      .filter(user => selected.includes(user._id))
      .map(user => user.name)
      .join(', ');
  }, [options, selected, placeholder]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : ''}`}>
          {getSelectedNames}
        </span>
        <FiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
          <div className="py-1  bg-gray-700 ">
            {options.map(user => (
              <div
                key={user._id}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                onClick={() => toggleOption(user._id)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-2 ${selected.includes(user._id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                  {selected.includes(user._id) && <FiCheck className="w-3 h-3 dark:text-gray-100 text-gray-700 " />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-100 dark:text-gray-100 text-gray-700">{user.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">{user.email}</div>
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
});

MultiSelectDropdown.displayName = 'MultiSelectDropdown';

const App = () => {
  const { admin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState('Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Meeting>({ id: null, title: '', description: '', attendees: [], category: 'Meeting', start: new Date(), end: addHours(new Date(), 1) });
  const [filteredCategories, setFilteredCategories] = useState<string[]>(categories);
  const [currentUserId, setCurrentUserId] = useState(admin?.id);
  const [events, setEvents] = useState<Meeting[]>([]);
  const [assignedByUserList, setAssignedByUserList] = useState<User[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<Meeting | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (admin?.id) {
      setCurrentUserId(admin.id);
    }
  }, [admin]);

  const fetchEvents = useCallback(async () => {
    try {
      const [usersRes, meetingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=All&isActive=true`, { credentials: "include" }),
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
    } catch (error) {
      console.error('Error saving event:', error);
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

  const renderMonthView = useCallback(() => {
    const today = startOfDay(new Date());
    return (
      <div className="grid grid-cols-7 gap-px flex-grow bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-100 shadow-lg">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-1 sm:py-2 text-xs sm:text-sm text-gray-400 font-semibold border border-gray-300 dark:border-gray-100">
            {day}
          </div>
        ))}
        {getMonthDays.map((day, idx) => {
          const dayMeetings = visibleMeetings.filter(meeting =>
            isSameDay(new Date(meeting.start), day)
          );
          const isTodayCheck = isToday(day);
          const isPastDay = isBefore(day, today);

          return (
            <div
              key={idx}
              className={`p-0.5 sm:p-1 min-h-[80px] sm:min-h-[100px] border border-gray-400 dark:border-gray-100 transition-colors duration-200 relative group
                       
                        ${isTodayCheck ? 'relative z-10 before:absolute before:inset-0 before:bg-blue-100 before:bg-opacity-20 dark:before:bg-gray-300 dark:before:bg-opacity-20 before:rounded-lg' : ''}
                        ${isPastDay ? 'cursor-not-allowed opacity-50' : 'dark:hover:bg-gray-700  hover:bg-gray-200 cursor-pointer'}
                        ${isDragging && draggedEvent ? 'opacity-75' : ''}`}
              onClick={() => !isPastDay && handleDayClick(day)}
              onDragOver={e => !isPastDay && handleDragOver(e)}
              onDrop={e => !isPastDay && handleDrop(e, day)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className={`text-sm font-medium relative z-20 ${!isSameMonth(day, currentDate) ? 'text-gray-600' :
                  isTodayCheck ? ' text-blue-500 font-bold' : 'dark:text-gray-100 text-gray-700'
                  }`}>
                  {format(day, 'd')}
                </div>
                {dayMeetings.length > 2 && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-100 bg-gray-500 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-600 transition-colors">
                      +{dayMeetings.length - 2} more events
                    </div>
                  </div>
                )}
                {/* {dayMeetings.length > 0 && (
                  <div className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                    {dayMeetings.length}
                  </div>
                )} */}
              </div>

              <div className="space-y-1 relative ">
                {dayMeetings.slice(0, 2).map(meeting => (
                  <div
                    key={meeting.id}
                    draggable={meeting.creator === currentUserId && !isPastDay}
                    onDragStart={e => handleDragStart(e, meeting)}
                    onDragEnd={handleDragEnd}
                    className="group/event relative"
                  >
                    <div className={`text-xs dark:text-gray-100 text-gray-700 p-1 rounded-md overflow-hidden whitespace-nowrap overflow-ellipsis cursor-move flex items-center space-x-1 ${meeting.color} hover:opacity-80 transition-opacity`}>
                      <GripVertical size={10} className="flex-shrink-0 opacity-70" />
                      <span className="truncate">{format(new Date(meeting.start), 'ha')} {meeting.title}</span>
                    </div>

                    <div className="absolute  w-full lg:w-64 hidden group-hover/event:block z-50 top-full left-0 mt-1 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl transform origin-top transition-all duration-200 scale-95 group-hover/event:scale-100 hover-card">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold dark:text-gray-100 text-gray-700 text-sm">{meeting.title}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs ${meeting.color} dark:text-gray-100 text-gray-700`}>
                            {meeting.category}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                          <Calendar size={12} />
                          <span>{format(new Date(meeting.start), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                          <Clock size={12} />
                          <span>{format(new Date(meeting.start), 'h:mm a')} - {format(new Date(meeting.end), 'h:mm a')}</span>
                        </div>
                        {meeting.description && (
                          <div className="text-xs text-gray-400 mt-2">
                            <p className="line-clamp-2">{meeting.description}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <div className="flex items-center space-x-2 text-xs text-gray-300 mb-1">
                            <Users size={12} />
                            <span className="font-medium">Attendees:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {meeting.attendees.slice(0, 3).map(_id => {
                              const user = assignedByUserList.find(u => u._id === _id);
                              return user ? (
                                <span key={_id} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                                  {user.name}
                                </span>
                              ) : null;
                            })}
                            {meeting.attendees.length > 3 && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                                +{meeting.attendees.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        {meeting.creator === currentUserId && !isPastDay && (
                          <div className="flex items-center space-x-2 pt-2 border-t border-gray-700">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditEvent(meeting); }}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(meeting); }}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
                            >
                              <X size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>



              {isDragging && draggedEvent && !isPastDay && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg pointer-events-none border-2 border-dashed border-blue-400"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [currentDate, visibleMeetings, handleDayClick, handleDragOver, handleDrop, isDragging, draggedEvent, currentUserId, handleDragStart, handleDragEnd, handleEditEvent, handleDeleteEvent, assignedByUserList, getMonthDays]);

  const renderWeekView = useCallback(() => {
    const today = startOfDay(new Date());
    const getMeetingStyle = (meeting: Meeting) => {
      const start = new Date(meeting.start);
      const end = new Date(meeting.end);
      const totalMinutesInDay = 24 * 60;
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return {
        top: `${(startMinutes / totalMinutesInDay) * 100}%`,
        height: `${Math.min((durationMinutes / totalMinutesInDay) * 100, 100)}%`,
      };
    };

    return (
      <div className="relative flex flex-col flex-grow">
        <div className="grid grid-cols-7 gap-px bg-gray-700">
          {getWeekDays.map((day, idx) => {
            const isPastDay = isBefore(day, today);
            return (
              <div
                key={idx}
                className={`text-center py-1 sm:py-2 text-xs sm:text-sm font-semibold border-b border-gray-700 bg-gray-800 relative
                            ${isPastDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {daysOfWeek[idx]} <span className="font-normal">{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>
        <div className="relative flex flex-row flex-grow overflow-auto">
          {getWeekDays.map((day, dayIndex) => {
            const isPastDay = isBefore(day, today);
            return (
              <div key={dayIndex} className="relative flex-1 border-r border-gray-700 min-h-[600px] sm:min-h-[1000px] overflow-hidden">
                <div
                  className="absolute inset-0"
                  onDragOver={e => !isPastDay && handleDragOver(e)}
                  onDrop={e => !isPastDay && handleDrop(e, day)}
                >
                  {isDragging && !isPastDay && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded pointer-events-none"></div>
                  )}
                </div>

                {visibleMeetings.filter(m =>
                  isSameDay(new Date(m.start), day)
                ).map(meeting => {
                  const isPastMeeting = isBefore(new Date(meeting.start), new Date());
                  return (
                    <div
                      key={meeting.id}
                      draggable={meeting.creator === currentUserId && !isPastMeeting}
                      onDragStart={e => !isPastMeeting && handleDragStart(e, meeting)}
                      onDragEnd={handleDragEnd}
                      className={`absolute left-1 right-1 p-1 rounded-md text-xs dark:text-gray-100 text-gray-700 cursor-move flex items-center space-x-1 ${meeting.color} hover:opacity-80 transition-opacity
                                  ${isPastMeeting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={getMeetingStyle(meeting)}
                    >
                      <GripVertical size={10} className="flex-shrink-0 opacity-70" />
                      <div>
                        <div className="font-semibold">{format(new Date(meeting.start), 'h:mm')}</div>
                        <div className="truncate">{meeting.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [visibleMeetings, handleDragOver, handleDrop, isDragging, currentUserId, handleDragStart, handleDragEnd, getWeekDays, daysOfWeek]);

  const renderDayView = useCallback(() => {
    const isPastDay = isBefore(selectedDay, startOfDay(new Date()));
    const dayMeetings = visibleMeetings.filter(m => isSameDay(new Date(m.start), selectedDay)).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return (
      <div
        className="relative flex flex-col flex-grow overflow-y-auto dark:bg-gray-800 bg-white rounded-lg p-3 sm:p-4"
        onDragOver={e => !isPastDay && handleDragOver(e)}
        onDrop={(e) => !isPastDay && handleDrop(e, selectedDay)}
      >
        {isDragging && !isPastDay && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg pointer-events-none"></div>
        )}

        <h2 className="text-lg sm:text-2xl font-bold dark:text-gray-100 text-gray-700 mb-4 relative z-10">
          {format(selectedDay, 'EEEE, MMMM d, yyyy')}
        </h2>
        <div className="space-y-4 relative z-10">
          {dayMeetings.length > 0 ? (
            dayMeetings.map(meeting => {
              const isPastMeeting = isBefore(new Date(meeting.start), new Date());
              return (
                <div
                  key={meeting.id}
                  // draggable={meeting.creator === currentUserId && !isPastMeeting}
                  // onDragStart={e => !isPastMeeting && handleDragStart(e, meeting)}
                  // onDragEnd={handleDragEnd}
                  className={`flex items-start p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01] relative ${meeting.color}
                              ${isPastMeeting ? 'opacity-50 cursor-not-allowed' : 'cursor-move'}`}
                >
                  {isPastMeeting ? null : (
                    <GripVertical size={16} className="flex-shrink-0 opacity-70 mr-2 mt-1" />
                  )}

                  <div className="w-1/4 flex-shrink-0">
                    <p className="font-semibold text-sm dark:text-gray-100 text-gray-700">{format(new Date(meeting.start), 'h:mm a')}</p>
                    <p className="text-xs dark:text-gray-100 text-gray-700">{format(new Date(meeting.end), 'h:mm a')}</p>
                  </div>
                  <div className="w-3/4 flex items-start justify-between flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-bold text-base dark:text-gray-100 text-gray-700">{meeting.title}</h3>
                      <p className="text-sm dark:text-gray-100 text-gray-900 mt-1">{meeting.description}</p>
                      <div className="mt-2 flex items-center space-x-2 text-xs dark:text-gray-100 text-gray-900">
                        <span className="font-semibold">Attendees:</span>
                        {meeting.attendees.map(_id => assignedByUserList.find(u => u._id === _id)?.name).join(', ')}
                      </div>
                    </div>
                    {meeting.creator === currentUserId && !isPastMeeting && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditEvent(meeting)}
                          className="dark:text-gray-100 text-gray-700 dark:hover:text-gray-100 hover:text-gray-900 transition-colors p-1"
                          title="Edit event"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(meeting)}
                          className="dark:text-gray-100 text-gray-700 dark:hover:text-gray-100 hover:text-gray-900 transition-colors p-1"
                          title="Delete event"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 py-10">No meetings for this day.</div>
          )}
        </div>
      </div>
    );
  }, [selectedDay, visibleMeetings, handleDragOver, handleDrop, isDragging, currentUserId, handleDragStart, handleDragEnd, handleEditEvent, handleDeleteEvent, assignedByUserList]);

  const renderListView = useCallback(() => {
    const sortedMeetings = [...visibleMeetings].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const now = new Date();

    return (
      <div className="flex flex-col flex-grow overflow-y-auto bg-gray-800 rounded-lg p-3 sm:p-4">
        <h2 className="text-lg sm:text-2xl font-bold dark:text-gray-100 text-gray-700 mb-4">Upcoming Meetings</h2>
        <div className="space-y-4">
          {sortedMeetings.length > 0 ? (
            sortedMeetings.map(meeting => {
              const isPastMeeting = isBefore(new Date(meeting.start), now);
              return (
                <div
                  key={meeting.id}
                  draggable={meeting.creator === currentUserId && !isPastMeeting}
                  onDragStart={e => !isPastMeeting && handleDragStart(e, meeting)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01] relative ${meeting.color}
                              ${isPastMeeting ? 'opacity-50 cursor-not-allowed' : 'cursor-move'}`}
                >
                  {isPastMeeting ? null : (
                    <GripVertical size={16} className="flex-shrink-0 opacity-70 mr-2 mb-2 sm:mb-0" />
                  )}

                  <div className="w-full sm:w-1/5 flex-shrink-0 mb-2 sm:mb-0">
                    <div className="text-sm font-semibold dark:text-gray-100 text-gray-700">
                      {format(new Date(meeting.start), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-200">
                      {format(new Date(meeting.start), 'h:mm a')} - {format(new Date(meeting.end), 'h:mm a')}
                    </div>
                  </div>
                  <div className="flex-grow ml-0 sm:ml-4 mb-2 sm:mb-0">
                    <h3 className="font-bold text-base dark:text-gray-100 text-gray-700">{meeting.title}</h3>
                    <p className="text-sm text-gray-200">{meeting.description}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:w-auto ml-0 sm:ml-4">
                    <div className="text-xs text-gray-100">
                      <span className="font-semibold">Attendees:</span>
                      {meeting.attendees.map(id => assignedByUserList.find(u => u._id === id)?.name).join(', ')}
                    </div>
                    {meeting.creator === currentUserId && !isPastMeeting && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditEvent(meeting)}
                          className="dark:text-gray-100 text-gray-700 hover:text-gray-300 transition-colors p-1"
                          title="Edit event"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(meeting)}
                          className="dark:text-gray-100 text-gray-700 hover:text-white transition-colors p-1"
                          title="Delete event"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 py-10">No upcoming meetings.</div>
          )}
        </div>
      </div>
    );
  }, [visibleMeetings, currentUserId, handleDragStart, handleDragEnd, handleEditEvent, handleDeleteEvent, assignedByUserList]);

  const isEditing = !!newEvent.id;

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white dark:text-gray-100 text-gray-700 font-inter flex flex-col p-2 sm:p-4 lg:p-8">
      <div className="mx-auto w-full flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[calc(100vh-1rem)]">
        <aside className="w-full text-gray-700 dark:text-gray-100 lg:w-84 border border-gray-200 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 flex flex-col space-y-4 lg:space-y-6 shadow-lg">
          <button
            onClick={handleAddEvent}
            className="flex items-center justify-center space-x-2 bg-indigo-600 dark:text-gray-100 text-gray-700 p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <Plus className='dark:text-gray-100 text-white' size={20} />
            <span className='dark:text-gray-100 text-white'>Add Event</span>
          </button>
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="text-gray-400 hover:text-gray-700 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
              <button onClick={handleNextMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-xs sm:text-sm">
              {daysOfWeek.map(day => <div key={day} className="text-gray-400 font-medium">{day}</div>)}
              {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) }).map((day, idx) => {
                const isPastDay = isBefore(day, startOfDay(new Date()));
                return (
                  <div
                    key={idx}
                    className={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200
                                ${!isSameMonth(day, currentDate) ? 'text-gray-600' : 'dark:text-gray-100 text-gray-700'}
                                ${isToday(day) ? 'bg-indigo-600 font-bold' : ''}
                                ${isSameDay(day, selectedDay) && !isToday(day) ? 'bg-gray-400' : 'hover:bg-gray-400 hover:dark:bg-gray-700'}
                                ${isPastDay ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => !isPastDay && handleDayClick(day)}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold mb-2">Event Filters</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
                  checked={filteredCategories.length === categories.length}
                  onChange={() => setFilteredCategories(filteredCategories.length === categories.length ? [] : categories)}
                />
                <span className='dark:text-gray-100 text-gray-700'>View All</span>
              </label>
              {categories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer dark:text-gray-100 text-gray-700 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
                    checked={filteredCategories.includes(category)}
                    onChange={() => toggleCategoryFilter(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-grow border border-gray-200 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 flex flex-col shadow-lg text-gray-700 dark:text-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6 ">
            <div className="flex items-center space-x-4">
              <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
              <button onClick={handleNextMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-full bg-white dark:bg-gray-800">
              <button
                onClick={() => setView('Month')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'Month' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white dark:hover:bg-gray-600 hover:bg-indigo-500'}`}
              >
                Month
              </button>
              {/* <button
                onClick={() => setView('Week')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'Week' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
              >
                Week
              </button> */}
              <button
                onClick={() => setView('Day')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'Day' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white dark:hover:bg-gray-600 hover:bg-indigo-500'}`}
              >
                Day
              </button>
              <button
                onClick={() => setView('List')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'List' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white dark:hover:bg-gray-600 hover:bg-indigo-500'}`}
              >
                List
              </button>
            </div>
          </div>
          {view === 'Month' && renderMonthView()}
          {view === 'Week' && renderWeekView()}
          {view === 'Day' && renderDayView()}
          {view === 'List' && renderListView()}

          {isDragging && draggedEvent && (
            <div className="fixed pointer-events-none z-50 bg-white dark:bg-gray-800 bg-opacity-90 text-gray-900 p-2 rounded-lg shadow-lg border border-gray-300 max-w-sm">
              <div className="flex items-center space-x-2">
                <GripVertical size={16} className="text-gray-900 dark:text-gray-100" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{draggedEvent.title}</div>
                  <div className="text-xs ext-gray-900 dark:text-gray-500">
                    {format(new Date(draggedEvent.start), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {isModalOpen && (
        <div className=" fixed inset-0 bg-gray-900/50 backdrop-blur-md  flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto ">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold dark:text-gray-100 text-gray-700 mb-6">{isEditing ? 'Edit Scheduler' : 'Add New Scheduler'}</h3>
            <form onSubmit={handleModalSubmit} className="space-y-4 ">
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <Label className='text-gray-100' htmlFor="title">Title</Label>
                  <input
                    id="title"
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <Label className='text-gray-100' htmlFor="start">Start</Label>
                  <input
                    id="start"
                    type="datetime-local"
                    value={format(new Date(newEvent.start), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                    className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <Label className='text-gray-100' htmlFor="end">End</Label>
                  <input
                    id="end"
                    type="datetime-local"
                    value={format(new Date(newEvent.end), "yyyy-MM-dd'T'HH:mm")}
                    min={format(new Date(newEvent.start), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                    className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <Label className='text-gray-100' htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <Label className='text-gray-100' htmlFor="attendees">Assign To</Label>
                  <MultiSelectDropdown
                    options={assignedByUserList.filter(u => u._id !== currentUserId)}
                    selected={newEvent.attendees}
                    onChange={handleAttendeeChange}
                    placeholder="Select users to assign"
                  />
                </div>
              </div>
              <div>
                <Label className='text-gray-100' htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 dark:text-gray-100 text-gray-700 border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                ></textarea>
              </div>
              <button
                type="submit"
                className=" bg-indigo-600 dark:text-gray-100 text-gray-700 p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {isEditing ? 'Update Event' : 'Save Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;