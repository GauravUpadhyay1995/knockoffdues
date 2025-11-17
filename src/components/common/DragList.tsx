"use client";

import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { X } from "lucide-react";

const DraggableBox = () => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    // Controlled draggable position
    const [position, setPosition] = useState({ x: 0, y: 50 });

    // Toast state
    const [toast, setToast] = useState<string | null>(null);

    // Show toast
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 1500); // Hide in 1.5s
    };

    // Copy handler
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${text} copied!`);
    };

    // Reset draggable position when closing drawer
    const handleClose = () => {
        setOpen(false);
        setPosition({ x: 0, y: 50 }); // RESET
    };

    return (
        <>
            {/* TOAST MESSAGE */}
            {toast && (
                <div className="fixed z-80 top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-toast">
                    {toast}
                </div>
            )}

            {/* OPEN BUTTON */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed top-20 right-4 bg-orange-900 text-white p-3 rounded-full shadow-lg animate-pulse duration-100"
                >
                    See List
                </button>
            )}

            {/* DRAWER */}
            <div
                className={`fixed top-20 right-0 transition-transform duration-500 ease-out 
        ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* CLOSE ICON */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 bg-red-900 text-white p-2 rounded-full shadow"
                >
                    <X size={20} />
                </button>

                {/* DRAGGABLE CONTENT */}
                <Draggable
                    nodeRef={nodeRef}
                    position={position}
                    onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
                >
                    <div
                        ref={nodeRef}
                        className="cursor-move max-h-[40vh] md:max-h-[30vh] lg:max-h-[100vh] overflow-y-auto  "
                    >
                        <p className="bg-orange-900 text-white font-semibold text-center border-b py-2">
                            You Can Drag this div (double click to copy variable)
                        </p>

                        {/* ROW 1 */}
                        <div className="bg-orange-900 text-white font-semibold px-4 py-3 shadow-lg 
                  grid grid-cols-2 sm:grid-cols-2 lg:flex gap-6 ">

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeName}")}
                                >
                                    {`{#employeeName}`}
                                </span>
                                <span>Employee Name</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeEmail}")}
                                >
                                    {`{#employeeEmail}`}
                                </span>
                                <span>Employee Email</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeMobile}")}
                                >
                                    {`{#employeeMobile}`}
                                </span>
                                <span>Employee Mobile</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeRole}")}
                                >
                                    {`{#employeeRole}`}
                                </span>
                                <span>Employee Role</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeePosition}")}
                                >
                                    {`{#employeePosition}`}
                                </span>
                                <span>Employee Position</span>
                            </div>

                        </div>
                        {/* ROW 2 */}
                        <div className="bg-orange-900 text-white font-semibold px-4 py-3 shadow-lg 
                  grid grid-cols-2 sm:grid-cols-2 lg:flex gap-6 ">


                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeAddress}")}
                                >
                                    {`{#employeeAddress}`}
                                </span>
                                <span>Employee Address</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeDepartment}")}
                                >
                                    {`{#employeeDepartment}`}
                                </span>
                                <span>Employee Department</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeJoiningDate}")}
                                >
                                    {`{#employeeJoiningDate}`}
                                </span>
                                <span>Employee Joining Date</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeJoiningLetterUrl}")}
                                >
                                    {`{#employeeJoiningLetterUrl}`}
                                </span>
                                <span>Employee Joining Letter Url</span>
                            </div>



                        </div>

                        {/* ROW 3 */}
                        <div className="bg-orange-900 text-white font-semibold px-4 py-3 shadow-lg 
                  grid grid-cols-2 sm:grid-cols-2 lg:flex gap-6 ">

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#OTPCode}")}
                                >
                                    {`{#OTPCode}`}
                                </span>
                                <span>OTP Code</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeID}")}
                                >
                                    {`{#employeeID}`}
                                </span>
                                <span>Employee ID</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#employeeExperienceLetterUrl}")}
                                >
                                    {`{#employeeExperienceLetterUrl}`}
                                </span>
                                <span>Employee Experience Letter Url</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#emailVerificationLink}")}
                                >
                                    {`{#emailVerificationLink}`}
                                </span>
                                <span>Email Verification Link</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#currentDate}")}
                                >
                                    {`{#currentDate}`}
                                </span>
                                <span>Current Date</span>
                            </div>


                        </div>

                        <div className="bg-orange-900 text-white font-semibold px-4 py-3 shadow-lg 
                  grid grid-cols-2 sm:grid-cols-2 lg:flex gap-6 ">

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#companyLogo}")}
                                >
                                    {`{#companyLogo}`}
                                </span>
                                <span>Company Logo</span>
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#companyName}")}
                                >
                                    {`{#companyName}`}
                                </span>
                                <span>Company Name</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#companyEmail}")}
                                >
                                    {`{#companyEmail}`}
                                </span>
                                <span>Company Email</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#companyWhatsapp}")}
                                >
                                    {`{#companyWhatsapp}`}
                                </span>
                                <span>Company Whatsapp</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-yellow-300 cursor-pointer"
                                    onDoubleClick={() => handleCopy("{#companyAddress}")}
                                >
                                    {`{#companyAddress}`}
                                </span>
                                <span>Company Address</span>
                            </div>


                        </div>
                    </div>

                </Draggable>
            </div>
        </>
    );
};

export default DraggableBox;
