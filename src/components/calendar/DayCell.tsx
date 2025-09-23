// components/calendar/DayCell.tsx
import React from 'react';
import { format, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';
import EventCard from './EventCard';

interface DayCellProps {
  day: Date;
  currentDate: Date;
  meetings: any[];
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

const DayCell: React.FC<DayCellProps> = ({
  day,
  currentDate,
  meetings,
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
  const today = startOfDay(new Date());
  const isTodayCheck = isToday(day);
  const isPastDay = isBefore(day, today);

  return (
    <div
      className={`
        p-1 sm:p-2 md:p-1.5
              min-h-[10px] sm:min-h-[10px] md:min-h-[10px] 

        border border-gray-400 dark:border-gray-100 
        transition-colors duration-200 relative group
        ${isTodayCheck ? 'relative bg-gray-100' : ''}
        ${isPastDay ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-900' : 'dark:hover:bg-gray-700 hover:bg-gray-200 cursor-pointer'}
        ${isDragging && draggedEvent ? 'opacity-75' : ''}
        flex flex-col
      `}
      onClick={() => !isPastDay && onDayClick(day)}
      onDragOver={(e) => !isPastDay && onDragOver(e)}
      onDrop={(e) => !isPastDay && onDrop(e, day)}
    >
      <div className="flex justify-between items-start mb-1 px-1 sm:px-2">
        <div
          className={`text-sm sm:text-base font-medium relative ${!isSameMonth(day, currentDate)
              ? 'text-gray-600'
              : isTodayCheck
                ? 'text-blue-500 font-bold'
                : 'dark:text-gray-100 text-gray-700'
            }`}
        >
          {format(day, 'd')}
        </div>
        {meetings.length > 2 && (
          <div className="mt-1">
            <div className="text-xs sm:text-sm text-gray-100 bg-gray-500 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-600 transition-colors">
              +{meetings.length - 2} more
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1 sm:space-y-2 relative px-1 sm:px-2">
        {meetings.slice(0, 2).map((meeting) => (
          <EventCard
            key={meeting.id}
            meeting={meeting}
            currentUserId={currentUserId}
            assignedByUserList={assignedByUserList}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        ))}
      </div>

      {isDragging && draggedEvent && !isPastDay && (
        <div className="absolute inset-0 bg-blue-500  rounded-lg pointer-events-none border-2 border-dashed border-blue-400"></div>
      )}
    </div>
  );
};

export default DayCell;
