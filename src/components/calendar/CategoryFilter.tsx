// components/calendar/CategoryFilter.tsx
import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  filteredCategories: string[];
  onToggleCategory: (category: string) => void;
  onToggleAll: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  filteredCategories,
  onToggleCategory,
  onToggleAll,
}) => {
  return (
    <div className="flex-grow ">
      <h3 className="text-lg font-semibold mb-2">Event Filters</h3>
      <div className="space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
            checked={filteredCategories.length === categories.length}
            onChange={onToggleAll}
          />
          <span className="dark:text-gray-100 text-gray-700">View All</span>
        </label>
        {categories.map((category) => (
          <label
            key={category}
            className="flex items-center space-x-2 cursor-pointer dark:text-gray-100 text-gray-700 hover:text-white transition-colors"
          >
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
              checked={filteredCategories.includes(category)}
              onChange={() => onToggleCategory(category)}
            />
            <span>{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;