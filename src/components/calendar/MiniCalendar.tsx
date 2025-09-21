// components/calendar/MiniCalendar.tsx
import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  isBefore,
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  currentDate: Date;
  selectedDay: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDay,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}) => {
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  return (
    <div className="flex-shrink-0 ">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onPrevMonth} 
          className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors p-1"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={onNextMonth} 
          className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors p-1"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {daysOfWeek.map(day => (
          <div key={day} className="text-gray-500 font-medium py-1">
            {day}
          </div>
        ))}
        
        {monthDays.map((day, idx) => {
          const isPastDay = isBefore(day, startOfDay(new Date()));
          const isSelected = isSameDay(day, selectedDay);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={idx}
              className={`w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200 text-xs
                ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}
                ${isToday(day) ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-bold' : ''}
                ${isSelected && !isToday(day) ? 'bg-gray-300 dark:bg-gray-600' : ''}
                ${isPastDay ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}
              onClick={() => !isPastDay && onDayClick(day)}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;