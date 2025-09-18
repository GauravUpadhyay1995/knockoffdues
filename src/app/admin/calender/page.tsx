'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as LucideCalendar, List, UserCheck, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek, eachWeekOfInterval, addDays, getDay, startOfDay, endOfDay, addHours } from 'date-fns';

// Mock data to simulate the backend
const mockUsers = [
  { id: 'user-1', name: 'You' },
  { id: 'user-2', name: 'Jane Doe' },
  { id: 'user-3', name: 'John Smith' },
  { id: 'user-4', name: 'Alice Johnson' },
];

const mockMeetings = [
  { id: 'm1', title: 'Q3 Planning', description: 'Review Q3 goals.', start: new Date(2025, 8, 17, 10, 0), end: new Date(2025, 8, 17, 11, 0), creator: 'user-1', attendees: ['user-1', 'user-2', 'user-4'], category: 'Business', color: 'bg-blue-500' },
  { id: 'm2', title: 'Team Sync', description: 'Weekly sync up.', start: new Date(2025, 8, 24, 14, 30), end: new Date(2025, 8, 24, 15, 0), creator: 'user-2', attendees: ['user-1', 'user-2', 'user-3'], category: 'Business', color: 'bg-indigo-500' },
  { id: 'm3', title: 'Dentist Appointment', description: 'Check-up at the dentist.', start: new Date(2025, 8, 18, 12, 0), end: new Date(2025, 8, 18, 13, 0), creator: 'user-1', attendees: ['user-1'], category: 'Personal', color: 'bg-red-500' },
  { id: 'm4', title: 'Family Trip', description: 'Weekend getaway.', start: new Date(2025, 8, 21, 9, 0), end: new Date(2025, 8, 23, 17, 0), creator: 'user-3', attendees: ['user-1', 'user-3'], category: 'Family', color: 'bg-green-500' },
  { id: 'm5', title: 'Monthly Meeting', description: 'Review progress for the month.', start: new Date(2025, 9, 1, 9, 0), end: new Date(2025, 9, 1, 10, 0), creator: 'user-4', attendees: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Business', color: 'bg-purple-500' },
];

const categories = ['Personal', 'Business', 'Family', 'Holiday', 'ETC'];

const getColorForCategory = (cat) => {
  const colors = {
    Personal: 'bg-red-500',
    Business: 'bg-blue-500',
    Family: 'bg-green-500',
    Holiday: 'bg-yellow-500',
    ETC: 'bg-gray-500',
  };
  return colors[cat] || 'bg-gray-500';
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Start with September 2025
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState('Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', attendees: [], category: 'Personal', date: new Date() });
  const [filteredCategories, setFilteredCategories] = useState(['Personal', 'Business', 'Family', 'Holiday', 'ETC']);
  const [currentUserId, setCurrentUserId] = useState('user-1'); // Default user for this demo
  const [events, setEvents] = useState(mockMeetings);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const visibleMeetings = useMemo(() => {
    return events.filter(meeting =>
      (meeting.creator === currentUserId || meeting.attendees.includes(currentUserId)) &&
      filteredCategories.includes(meeting.category)
    );
  }, [events, currentUserId, filteredCategories]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleAddEvent = () => {
    setNewEvent({ title: '', description: '', attendees: [], category: 'Personal', date: selectedDay });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const start = new Date(newEvent.date);
    const end = addHours(start, 1);
    const newMeeting = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description || '',
      start,
      end,
      creator: currentUserId,
      attendees: [currentUserId, ...newEvent.attendees],
      category: newEvent.category,
      color: getColorForCategory(newEvent.category),
    };
    setEvents(prev => [...prev, newMeeting]);
    setNewEvent({ title: '', description: '', attendees: [], category: 'Personal', date: selectedDay });
    setIsModalOpen(false);
    // In a real app, you would make a POST request here
    // e.g., fetch('/api/meetings', { method: 'POST', body: JSON.stringify(newMeeting) });
  };

  const handleAttendeeChange = (userId) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId) ? prev.attendees.filter(id => id !== userId) : [...prev.attendees, userId]
    }));
  };

  const toggleCategoryFilter = (category) => {
    setFilteredCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderMonthView = () => {
    const startOfThisMonth = startOfMonth(currentDate);
    const endOfThisMonth = endOfMonth(currentDate);
    const startOfCalendar = startOfWeek(startOfThisMonth);
    const endOfCalendar = endOfWeek(endOfThisMonth);

    const days = eachDayOfInterval({ start: startOfCalendar, end: endOfCalendar });

    return (
      <div className="grid grid-cols-7 gap-px flex-grow bg-gray-700 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-1 sm:py-2 text-xs sm:text-sm text-gray-400 font-semibold border-b border-gray-700">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayMeetings = visibleMeetings.filter(meeting => {
            const meetingStart = startOfDay(new Date(meeting.start));
            const meetingEnd = endOfDay(new Date(meeting.end));
            const dayStart = startOfDay(day);
            return dayStart >= meetingStart && dayStart <= meetingEnd && isSameMonth(new Date(meeting.start), currentDate);
          });
          const isTodayCheck = isToday(day);

          return (
            <div
              key={idx}
              className={`p-0.5 sm:p-1 min-h-[80px] sm:min-h-[100px] bg-gray-800 border border-gray-700 transition-colors duration-200
                          ${!isSameMonth(day, currentDate) ? 'text-gray-600 bg-gray-900' : 'text-white'}
                          ${isTodayCheck ? 'relative z-10 before:absolute before:inset-0 before:bg-blue-600 before:bg-opacity-20 before:rounded-lg' : ''}
                          hover:bg-gray-700 cursor-pointer`}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-xs sm:text-sm font-medium relative z-20">
                {format(day, 'd')}
              </div>
              <div className="mt-1 space-y-1 relative z-20">
                {dayMeetings.slice(0, 3).map(meeting => (
                  <div
                    key={meeting.id}
                    className={`text-xs text-white p-1 rounded-md overflow-hidden whitespace-nowrap overflow-ellipsis ${meeting.color}`}
                  >
                    {format(new Date(meeting.start), 'ha')} {meeting.title}
                  </div>
                ))}
                {dayMeetings.length > 3 && (
                  <div className="text-xs text-gray-400 mt-1">
                    +{dayMeetings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfCurrentWeek = startOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfWeek(startOfCurrentWeek) });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getMeetingStyle = (meeting) => {
      const start = new Date(meeting.start);
      const end = new Date(meeting.end);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const startHour = start.getHours() + start.getMinutes() / 60;
      return {
        top: `${(startHour / 24) * 100}%`,
        height: `${(durationHours / 24) * 100}%`,
      };
    };

    return (
      <div className="relative flex flex-col flex-grow">
        <div className="grid grid-cols-7 gap-px bg-gray-700">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="text-center py-1 sm:py-2 text-xs sm:text-sm text-gray-400 font-semibold border-b border-gray-700 bg-gray-800">
              {day} <span className="font-normal">{format(days[idx], 'd')}</span>
            </div>
          ))}
        </div>
        <div className="relative flex flex-row flex-grow overflow-auto">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative flex-1 border-r border-gray-700 min-h-[600px] sm:min-h-[1000px] overflow-hidden">
              {visibleMeetings.filter(m => {
                const meetingStart = startOfDay(new Date(m.start));
                const meetingEnd = endOfDay(new Date(m.end));
                const dayStart = startOfDay(day);
                return dayStart >= meetingStart && dayStart <= meetingEnd;
              }).map(meeting => (
                <div
                  key={meeting.id}
                  className={`absolute left-1 right-1 p-1 rounded-md text-xs text-white ${meeting.color}`}
                  style={getMeetingStyle(meeting)}
                >
                  <div className="font-semibold">{format(new Date(meeting.start), 'h:mm a')}</div>
                  <div>{meeting.title}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };


  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayMeetings = visibleMeetings.filter(m => isSameDay(new Date(m.start), selectedDay)).sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
      <div className="relative flex flex-col flex-grow overflow-y-auto bg-gray-800 rounded-lg p-3 sm:p-4">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-4">
          {format(selectedDay, 'EEEE, MMMM d, yyyy')}
        </h2>
        <div className="space-y-4">
          {dayMeetings.length > 0 ? (
            dayMeetings.map(meeting => (
              <div
                key={meeting.id}
                className={`flex items-start p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01] ${meeting.color}`}
              >
                <div className="w-1/4">
                  <p className="font-semibold text-sm text-white">{format(new Date(meeting.start), 'h:mm a')}</p>
                  <p className="text-xs text-gray-200">{format(new Date(meeting.end), 'h:mm a')}</p>
                </div>
                <div className="w-3/4">
                  <h3 className="font-bold text-base text-white">{meeting.title}</h3>
                  <p className="text-sm text-gray-200 mt-1">{meeting.description}</p>
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-100">
                    <UserCheck size={14} />
                    <span className="font-semibold">Attendees:</span>
                    {meeting.attendees.map(id => mockUsers.find(u => u.id === id)?.name).join(', ')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10">No meetings for this day.</div>
          )}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedMeetings = [...visibleMeetings].sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
      <div className="flex flex-col flex-grow overflow-y-auto bg-gray-800 rounded-lg p-3 sm:p-4">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-4">Upcoming Meetings</h2>
        <div className="space-y-4">
          {sortedMeetings.length > 0 ? (
            sortedMeetings.map(meeting => (
              <div
                key={meeting.id}
                className={`flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01] ${meeting.color}`}
              >
                <div className="w-full sm:w-1/5 flex-shrink-0 mb-2 sm:mb-0">
                  <div className="text-sm font-semibold text-white">
                    {format(new Date(meeting.start), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-gray-200">
                    {format(new Date(meeting.start), 'h:mm a')} - {format(new Date(meeting.end), 'h:mm a')}
                  </div>
                </div>
                <div className="flex-grow ml-0 sm:ml-4 mb-2 sm:mb-0">
                  <h3 className="font-bold text-base text-white">{meeting.title}</h3>
                  <p className="text-sm text-gray-200">{meeting.description}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-100 ml-0 sm:ml-4">
                  <span className="font-semibold">Attendees:</span>
                  {meeting.attendees.map(id => mockUsers.find(u => u.id === id)?.name).join(', ')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10">No upcoming meetings.</div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter flex flex-col p-2 sm:p-4 lg:p-8">
      {/* Tailwind CSS and other head content */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="mx-auto w-full flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[calc(100vh-1rem)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 bg-gray-800 rounded-lg p-3 sm:p-6 flex flex-col space-y-4 lg:space-y-6 shadow-lg">
          <button
            onClick={handleAddEvent}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <Plus size={20} />
            <span>Add Event</span>
          </button>
          
          {/* Mini Calendar */}
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
              <button onClick={handleNextMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-xs sm:text-sm">
              {daysOfWeek.map(day => <div key={day} className="text-gray-400 font-medium">{day}</div>)}
              {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) }).map((day, idx) => (
                <div
                  key={idx}
                  className={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200
                              ${!isSameMonth(day, currentDate) ? 'text-gray-600' : 'text-white'}
                              ${isToday(day) ? 'bg-indigo-600 font-bold' : ''}
                              ${isSameDay(day, selectedDay) && !isToday(day) ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
                  onClick={() => handleDayClick(day)}
                >
                  {format(day, 'd')}
                </div>
              ))}
            </div>
          </div>

          {/* Event Filters */}
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
                <span>View All</span>
              </label>
              {categories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
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

        {/* Main Calendar View */}
        <main className="flex-grow bg-gray-800 rounded-lg p-3 sm:p-6 flex flex-col shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-4">
              <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
              <button onClick={handleNextMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-full">
              <button
                onClick={() => setView('Month')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'Month' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
              >
                Month
              </button>
              <button
                onClick={() => setView('Week')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'Week' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
              >
                Week
              </button>
              <button
                onClick={() => setView('Day')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'Day' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
              >
                Day
              </button>
              <button
                onClick={() => setView('List')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === 'List' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
              >
                List
              </button>
            </div>
          </div>
          {/* Calendar Grid */}
          {view === 'Month' && renderMonthView()}
          {view === 'Week' && renderWeekView()}
          {view === 'Day' && renderDayView()}
          {view === 'List' && renderListView()}
        </main>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Add New Event</h3>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Date</label>
                <input
                  type="datetime-local"
                  value={format(newEvent.date, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Assign to Employees</label>
                <div className="mt-2 space-y-2">
                  {mockUsers.filter(u => u.id !== currentUserId).map(user => (
                    <div key={user.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={newEvent.attendees.includes(user.id)}
                        onChange={() => handleAttendeeChange(user.id)}
                        className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
                      />
                      <label htmlFor={`user-${user.id}`} className="ml-2 text-gray-200">{user.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;