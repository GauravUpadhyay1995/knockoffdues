// components/calendar/MainCalendarView.tsx
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek, eachWeekOfInterval, addDays, getDay, startOfDay, endOfDay, addHours, isAfter, isBefore } from 'date-fns';
import DayCell from './DayCell';

interface MainCalendarViewProps {
  currentDate: Date;
  visibleMeetings: any[];
  isDragging: boolean;
  draggedEvent: any;
  currentUserId: string;
  assignedByUserList: any[];
  onDayClick: (day: Date) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, day: Date) => void;
  onDragStart: (e: React.DragEvent, meeting: any) => void;
  onDragEnd: () => void;
  onEditEvent: (meeting: any) => void;
  onDeleteEvent: (meeting: any) => void;
}

const MainCalendarView: React.FC<MainCalendarViewProps> = ({
  currentDate,
  visibleMeetings,
  isDragging,
  draggedEvent,
  currentUserId,
  assignedByUserList,
  onDayClick,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onEditEvent,
  onDeleteEvent,
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  return (
    <div className="grid grid-cols-7 gap-px flex-grow bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-100 shadow-lg ">
      {daysOfWeek.map((day) => (
        <div
          key={day}
          className="text-center py-1 sm:py-2 text-xs sm:text-sm text-gray-400 font-semibold "
        >
          {day}
        </div>
      ))}
      {monthDays.map((day, idx) => {
        const dayMeetings = visibleMeetings.filter((meeting) =>
          isSameDay(new Date(meeting.start), day)
        );

        return (
          <DayCell
            key={idx}
            day={day}
            currentDate={currentDate}
            meetings={dayMeetings}
            isDragging={isDragging}
            draggedEvent={draggedEvent}
            currentUserId={currentUserId}
            assignedByUserList={assignedByUserList}
            onDayClick={onDayClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        );
      })}
    </div>
  );
};

export default MainCalendarView;