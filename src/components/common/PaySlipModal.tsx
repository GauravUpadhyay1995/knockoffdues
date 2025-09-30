'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Button from '@/components/ui/button/Button';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Slip {
    url: string;
    _id?: string;
}

interface Payment {
    month: string;
    slip: Slip[];
    _id: string;
    vendor_id: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    payment: Payment[];
}

export default function PaySlipModal({ open, onClose, payment }: Props) {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<Payment[]>(payment);
    const [vendorId, setVendorId] = useState<string>("");

    useEffect(() => {
        if (payment && payment.length > 0) {
            // if all items have the same vendor_id you can just use the first one
            setVendorId(payment[0].vendor_id);
        } else {
            setVendorId(""); // reset when no payment
        }
    }, [payment]);

    // ✅ Keep local state synced with parent prop when it changes
    useEffect(() => setPayments(payment), [payment]);

    // ✅ Fetch reminders for a specific vendor
    const fetchReminders = useCallback(
        async (vendorId: string) => {
            if (!vendorId) return;
            try {
                   setLoading(true);

                const res = await fetch(`/api/v1/admin/reminders/${vendorId}`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch reminders');
                const result = await res.json();
                setPayments(result?.data?.payment || []); // Adjust to match API response
                   setLoading(false);

            } catch (err: any) {
                console.error('Error fetching reminders:', err);
                toast.error('Error refreshing reminder list');
            }
        },
        []
    );

    // ✅ Delete the entire payment object and refresh the list
    const deleteAll = async (vendorId: string, paymentId: string) => {
        setLoading(true);

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete the all invoice ,this action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete all invoice!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(
                    `/api/v1/admin/reminders/delete-all-payslip/${vendorId}/${paymentId}`,
                    { method: 'PATCH', credentials: 'include' }
                );

                if (!res.ok) {
                    const msg = await res.text();
                    toast.error(msg || 'Failed to delete payment');
                    return;
                }

                toast.success('Removed payment successfully');

                // ✅ Refresh only the list for this vendor
                await fetchReminders(vendorId);
            } catch (err) {
                console.error(err);
                toast.error('Error deleting payment');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }


    };

    const deleteSingle = async (vendorId: string, paymentId: string, paySlipId: string) => {
        setLoading(true);
        console.log("vendorId", vendorId)
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete invoice ,this action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete invoice!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(
                    `/api/v1/admin/reminders/delete-single-payslip/${vendorId}/${paymentId}/${paySlipId}`,
                    { method: 'PATCH', credentials: 'include' }
                );

                if (!res.ok) {
                    const msg = await res.text();
                    toast.error(msg || 'Failed to delete invoice');
                    return;
                }

                toast.success('Removed invoice successfully');

                // ✅ Refresh only the list for this vendor
                await fetchReminders(vendorId);
            } catch (err) {
                console.error(err);
                toast.error('Error deleting invoice');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }


    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl p-6 relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        >
                            <FiX className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl dark:text-gray-100 font-semibold mb-4">Payment Slips</h2>
                        {payments.length ? (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {[...payments]
                                    .sort((a, b) => b.month.localeCompare(a.month))
                                    .filter((p) => p.slip.length > 0) // ✅ filter out empty
                                    .map((p) => (
                                        <div
                                            key={p._id}
                                            className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                        >
                                            <div className="mb-2 flex justify-between items-center">
                                                <h3 className="font-medium text-gray-800 dark:text-white">
                                                    Month: {p.month}
                                                </h3>
                                                <button
                                                    title={`Delete All Invoice of Month - ${p.month}`}
                                                    onClick={() => deleteAll(vendorId, p._id)}
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                    disabled={loading}
                                                >
                                                    Delete All
                                                </button>
                                            </div>

                                            <ul className="list-disc list-inside space-y-1">
                                                {p.slip.map((s, idx) => (
                                                    <li
                                                        key={s._id ?? s.url}
                                                        className="dark:bg-black/40  flex justify-between items-center mb-1 border p-2 bg-red-100"
                                                    >
                                                        <a
                                                            title={`Download Invoice ${idx + 1}`}
                                                            href={s.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="dark:text-gray-100 text-purple-600 hover:underline break-all"
                                                        >
                                                            Download Invoice {idx + 1}
                                                        </a>
                                                        <button
                                                            onClick={() => deleteSingle(vendorId, p._id, s._id)}
                                                            title={`Delete Invoice ${idx + 1}`}
                                                            className="text-purple-600 hover:underline break-all"
                                                        >
                                                            <FiX className="w-6 h-6 text-red-500 hover:text-red-700" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">No payment data found.</p>
                        )}


                        <div className="mt-6 flex justify-end">

                            <Button className='mr-2 bg-orange-500' onClick={() => { fetchReminders(vendorId) }} size="sm" disabled={loading}>
                                {loading ? 'Please Wait...' : 'Refresh'}
                            </Button>
                            <Button className='bg-orange-500' onClick={onClose} size="sm" disabled={loading}>
                                {loading ? 'Please Wait...' : 'Close'}
                            </Button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
