"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"; // default icons (can override)

interface MenuItem {
    label: string;
    icon?: React.ElementType;
    disabled?: boolean;
    onClick?: () => void;
}

interface TableActionsProps {
    menuItems: MenuItem[];
}

export default function TableActions({ menuItems }: TableActionsProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right relative">
            <div className="inline-block text-blueGray-500" ref={dropdownRef}>
                {/* Trigger button */}
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="py-1 px-3 rounded-md hover:bg-gray-100 transition dark:hover:bg-gray-500"
                >
                    <MoreVertical className="w-4 h-4 dark:text-gray-100" />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="dropdown"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 mt-2 dark:bg-gray-900 bg-white border border-gray-100 rounded-md shadow-lg z-50 min-w-[10rem]"
                        >
                            {menuItems.map((item, index) => {
                                const Icon = item.icon || Edit; // fallback icon
                                return (
                                    <button
                                        disabled={item.disabled}
                                        key={index}
                                        onClick={() => {
                                            if (item.onClick) item.onClick();
                                            setOpen(false);
                                        }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition dark:text-gray-100 dark:hover:bg-gray-500"
                                    >
                                        <Icon className="w-4 h-4 dark:text-gray-100 text-gray-500" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </td>
    );
}
