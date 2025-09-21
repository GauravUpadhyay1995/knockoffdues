// components/form/MultiSelectDropdown.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface MultiSelectDropdownProps {
  options: User[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select users",
  disabled = false
}) => {
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
        disabled={disabled}
        className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm flex justify-between items-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : ''}`}>
          {getSelectedNames}
        </span>
        <FiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
          <div className="py-1">
            {options.map(user => (
              <div
                key={user._id}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                onClick={() => toggleOption(user._id)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-2 ${
                  selected.includes(user._id) 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'border-gray-300 dark:border-gray-500'
                }`}>
                  {selected.includes(user._id) && <FiCheck className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
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
};

export default MultiSelectDropdown;