import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  icon,
  className = "",
}) => (
  <motion.div
    className={`border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-700 ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-800 dark:to-gray-700 transition-all duration-300"
    >
      <div className="flex items-center space-x-3">
        {icon && <span className="text-orange-500 dark:text-orange-600">{icon}</span>}
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-left">
          {title}
        </span>
      </div>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-gray-500 dark:text-gray-300 text-lg"
      >
        ▼
      </motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="p-5 bg-white dark:bg-gray-900">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default AccordionSection;