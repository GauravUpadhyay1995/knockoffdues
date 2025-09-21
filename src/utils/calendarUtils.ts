// utils/calendarUtils.ts
export const getColorForCategory = (cat: string): string => {
  const colors: { [key: string]: string } = {
    Meeting: 'bg-red-300 text-red-800 dark:bg-red-900 dark:text-red-100',
    Task: 'bg-blue-300 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    Event: 'bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-100',
    Birthday: 'bg-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    Followup: 'bg-gray-300 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  };
  return colors[cat] || 'bg-gray-300 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
};

export const categories = ['Meeting', 'Task', 'Event', 'Birthday', 'Followup'];