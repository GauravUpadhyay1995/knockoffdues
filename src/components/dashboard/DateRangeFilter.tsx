'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format, startOfMonth } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateRangeFilterProps {
    onApply: (range: { startDate: Date; endDate: Date }) => void;
}

export default function DateRangeFilter({ onApply }: DateRangeFilterProps) {
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState([
        {
            startDate: startOfMonth(today), // 1st day of current month
            endDate: today, // today
            key: 'selection',
        },
    ]);

   const handleApply = () => {
    setOpen(false);

    // normalize and add 1 day
    const start = new Date(range[0].startDate!);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 1); // +1 day

    const end = new Date(range[0].endDate!);
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() + 1); // +1 day

    onApply({
        startDate: start,
        endDate: end,
    });
};


    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
                <span className="material-icons text-sm">calendar_today</span>
                {range[0].startDate && range[0].endDate ? (
                    <span>
                        {format(range[0].startDate, 'MMM d, yyyy')} -{' '}
                        {format(range[0].endDate, 'MMM d, yyyy')}
                    </span>
                ) : (
                    <span>Select Date Range</span>
                )}
            </button>

            {open && (
                <div className="absolute z-50 mt-2 bg-white p-3 rounded-2xl shadow-lg border">
                    <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={range}
                        rangeColors={['#4f46e5']}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
