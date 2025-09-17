"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTaskForm({ users }: { users: { _id: string; name: string }[] }) {
    const router = useRouter();
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleAssignedToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
        setAssignedTo(selectedOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("taskName", taskName);
            formData.append("description", description);
            formData.append("startDate", startDate);
            formData.append("endDate", endDate);
            formData.append("priority", priority);

            // Append assignedTo as array
            assignedTo.forEach((id) => formData.append("assignedTo[]", id));

            // Append files
            files.forEach((file) => formData.append("docs", file));

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/create`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                alert("Task created successfully!");
                router.push("/tasks"); // redirect to task list page
            } else {
                alert(data.message || "Something went wrong!");
            }
        } catch (error: any) {
            console.error(error);
            alert("Error creating task: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Create Task</h2>

            <label className="block mb-2">
                Task Name
                <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                    className="w-full p-2 border rounded mt-1"
                />
            </label>

            <label className="block mb-2">
                Description
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                />
            </label>

            <label className="block mb-2">
                Start Date
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full p-2 border rounded mt-1"
                />
            </label>

            <label className="block mb-2">
                End Date
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full p-2 border rounded mt-1"
                />
            </label>

            <label className="block mb-2">
                Priority
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </label>

            <label className="block mb-2">
                Assign To
                <select
                    multiple
                    value={assignedTo}
                    onChange={handleAssignedToChange}
                    className="w-full p-2 border rounded mt-1"
                >
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="block mb-2">
                Attach Documents
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded mt-1"
                />
            </label>

            <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {loading ? "Creating..." : "Create Task"}
            </button>
        </form>
    );
}
