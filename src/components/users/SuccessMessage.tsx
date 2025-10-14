import React from 'react';
import { motion } from 'framer-motion';

const SuccessMessage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed top-26 right-6 items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Profile updated successfully!
    </motion.div>
  );
};

export default SuccessMessage;