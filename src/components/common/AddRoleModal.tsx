"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';

export default function RolesModal({ onRolesAdded }: { onRolesAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [roles, setRoles] = useState<string[]>([""]);

    // Add new empty input field
    const addField = () => setRoles([...roles, ""]);

    // Remove input field
    const removeField = (index: number) => {
        setRoles(roles.filter((_, i) => i !== index));
    };

    // Update input value
    const handleChange = (index: number, value: string) => {
        const updated = [...roles];
        updated[index] = value;
        setRoles(updated);
    };

    // Submit multiple roles
    const handleSubmit = async () => {
        try {
            const filtered = roles.map((d) => d.trim()).filter(Boolean);
            if (filtered.length === 0) return;

            const res = await fetch("/api/v1/admin/roles/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filtered), // 👈 send array directly
            });

            const data = await res.json(); // 👈 parse JSON body

            if (!res.ok || !data.success) {
                toast.error(data?.message || "Failed to add roles");
                return; // ⛔ stop here if error
            }

            toast.success("Roles added successfully");
            onRolesAdded?.(); // refresh list
            setRoles([""]); // reset
            setIsOpen(false); // close modal
        } catch (err: any) {
            console.error("Error in handleSubmit:", err);
            toast.error(err?.message || "Something went wrong");
        }
    };



    return (
        <>
            {/* Trigger Button */}
            <Button onClick={() => setIsOpen(true)} variant="outline"
                size="sm"
                className="flex items-center gap-2">
                + Add Roles
            </Button>

            {/* Modal */}
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
                        <Dialog.Title className="text-lg font-semibold mb-4 dark:text-gray-300">Add Roles</Dialog.Title>

                        <div className="space-y-2">
                            {roles.map((dept, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={dept}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        placeholder={`Roles ${index + 1}`}
                                        className="w-full border rounded px-2 py-1 dark:text-gray-300"
                                    />
                                    {roles.length > 1 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeField(index)}
                                            className="dark:text-gray-300"
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addField}>
                                + Add Another
                            </Button>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" className="dark:text-gray-300" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} className=" text-white dark:text-gray-300">
                                Save
                            </Button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}
