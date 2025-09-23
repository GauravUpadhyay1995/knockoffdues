// components/calendar/CalendarHeader.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  FiRefreshCw

} from 'react-icons/fi';
interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  view: string;
  onViewChange: (view: string) => void;
  reloadData:()=>void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrev,
  onNext,
  view,
  onViewChange,
  reloadData
}) => {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center space-x-4">
        <button onClick={onPrev} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-full bg-white dark:bg-gray-800">
        <button onClick={reloadData} className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <FiRefreshCw className="mr-2" /> Refresh</button>
        {['Month', 'Day'].map((viewOption) => (
          <button
            key={viewOption}
            onClick={() => onViewChange(viewOption)}
            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${view === viewOption
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white dark:hover:bg-gray-600 hover:bg-indigo-500'
              }`}
          >
            {viewOption}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;