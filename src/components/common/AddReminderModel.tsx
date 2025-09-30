"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiPlus, FiArrowLeft, FiCalendar, FiUser, FiClock, FiDownload, FiPaperclip, FiRefreshCw } from 'react-icons/fi';
import Button from "@/components/ui/button/Button";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import PaySlipModal from '@/components/common/PaySlipModal';

interface Reminder {
  _id: string;
  vendorName: string;
  description: string;
  billingDate: string;
  amount: number;
  senderReceiver: string;
  reminderType: "BEFORE_DAYS" | "WEEKLY";
  beforeDays: number;
  timeOfDay: string;
  paymentStatus: "PAID" | "PENDING";
  vendorStatus: boolean;
  paymentMonth: string;
  agreement?: string;
  payment?: any[];
}

interface Props {
  onRemindersAdded: () => void;
  editData?: Reminder;
  isEdit?: boolean;
  onClose?: () => void;
}

export default function AddReminderModal({
  onRemindersAdded,
  editData,
  isEdit = false,
  onClose
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaySlipModal, setShowPaySlipModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any[]>([]);

  const [form, setForm] = useState<{
    vendorName: string;
    description: string;
    billingDate: string;
    amount: number;
    senderReceiver: string;
    reminderType: "BEFORE_DAYS" | "WEEKLY";
    beforeDays: number;
    timeOfDay: string;
    paymentStatus: "PAID" | "PENDING";
    vendorStatus: boolean;
    paymentMonth: string;
    agreement: string;
    payment: any[];
  }>({
    vendorName: "",
    description: "",
    billingDate: "",
    amount: 0,
    senderReceiver: "",
    reminderType: "BEFORE_DAYS",
    beforeDays: 1,
    timeOfDay: "12:00",
    paymentStatus: "PENDING",
    vendorStatus: true,
    paymentMonth: "",
    agreement: "",
    payment: [],
  });

  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [slipFiles, setSlipFiles] = useState<File[]>([]);

  // Load edit data when component opens in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      const billingDate = editData.billingDate
        ? new Date(editData.billingDate).toISOString().slice(0, 16)
        : "";

      setForm({
        vendorName: editData.vendorName || "",
        description: editData.description || "",
        billingDate,
        amount: editData.amount || 0,
        senderReceiver: editData.senderReceiver || "",
        reminderType: editData.reminderType || "BEFORE_DAYS",
        beforeDays: editData.beforeDays || 1,
        timeOfDay: editData.timeOfDay || "12:00",
        paymentStatus: editData.paymentStatus || "PENDING",
        vendorStatus:
          editData.vendorStatus !== undefined ? editData.vendorStatus : true,
        paymentMonth: "",
        agreement: editData.agreement || "",
        payment: editData.payment?.length
          ? editData.payment.map((p) => ({
            ...p,
            vendor_id: editData._id, // ✅ add vendor_id to each item
          }))
          : [],
      });
    }
  }, [isEdit, editData]);

  const reset = () => {
    if (!isEdit) {
      setOpen(false);
    }
    setForm({
      vendorName: "",
      description: "",
      billingDate: "",
      amount: 0,
      senderReceiver: "",
      reminderType: "BEFORE_DAYS",
      beforeDays: 1,
      timeOfDay: "12:00",
      paymentStatus: "PENDING",
      vendorStatus: true,
      paymentMonth: "",
      agreement: "",
      payment: [],
    });
    setAgreementFile(null);
    setSlipFiles([]);
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!form.vendorName || !form.billingDate || !form.amount || !form.senderReceiver) {
      toast.error("Vendor Name, Billing Date, and Amount are required");
      return;
    }

    if (form.paymentStatus === "PAID" && (!form.paymentMonth || slipFiles.length <= 0)) {
      toast.error("Payment Month & payment Slip is Mandatory");
      return;
    }

    const fd = new FormData();
    fd.append("vendorName", form.vendorName);
    fd.append("description", form.description);
    fd.append("billingDate", form.billingDate);
    fd.append("amount", String(form.amount)); // ← CONVERT TO STRING
    fd.append("senderReceiver", form.senderReceiver);
    fd.append("reminderType", form.reminderType);
    fd.append("beforeDays", String(form.beforeDays));
    fd.append("timeOfDay", form.timeOfDay);
    fd.append("paymentStatus", form.paymentStatus);
    fd.append("vendorStatus", String(form.vendorStatus));
    fd.append("paymentMonth", form.paymentMonth);

    if (agreementFile) fd.append("agreement", agreementFile);
    slipFiles.forEach((f) => fd.append("paymentSlip", f));

    setLoading(true);
    try {
      const url = isEdit && editData
        ? `/api/v1/admin/reminders/update/${editData._id}`
        : "/api/v1/admin/reminders/create";

      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      toast.success(`Reminder ${isEdit ? "updated" : "created"} successfully`);
      onRemindersAdded();
      reset();
    } catch (err: any) {
      toast.error(err.message || `Error ${isEdit ? "updating" : "creating"} reminder`);
    } finally {
      setLoading(false);
    }
  };
  const isModalOpen = isEdit ? true : open;
  const handlePaySlipModal = (payment: any[] = []) => {
    console.log("payment", payment)
    setSelectedPayment(payment);
    setShowPaySlipModal(true);
  };
  return (
    <>
      {!isEdit && (
        <Button
          onClick={() => setOpen(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Add Reminder
        </Button>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 relative shadow-xl mx-auto max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={reset}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 z-10"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
                {isEdit ? "Edit Reminder" : "Create Reminder"}
              </h2>

              <div className="space-y-3">
                {/* Vendor Name & Agreement */}
                <div className={`grid grid-cols-${form?.agreement?.length > 0 ? "3" : "2"} sm:grid-cols-${form?.agreement?.length > 0 ? "3" : "2"} gap-3`}>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Vendor Name *</label>
                    <input
                      type="text"
                      placeholder="Vendor Name"
                      value={form.vendorName}
                      onChange={(e) =>
                        setForm({ ...form, vendorName: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Upload Agreement   </label>

                    <input
                      type="file"
                      onChange={(e) =>
                        setAgreementFile(e.target.files ? e.target.files[0] : null)
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 dark:bg-gray-700 dark:text-white text-base file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                    />

                  </div>
                  {form?.agreement?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-100">Download Agreement   </label>
                      <a
                        href={form.agreement}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 truncate max-w-xs"
                      >
                        <FiDownload />
                      </a>


                    </div>
                  )}
                </div>

                {/* Amount, Sender/Receiver, Vendor Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Amount *</label>
                    <input
                     type="text"
                    value={form.amount}
                    onChange={(e) => {
                      setForm({ ...form, amount: Number(e.target.value) })
                    }}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Sender/Receiver *</label>
                    <select
                      value={form.senderReceiver}
                      onChange={(e) =>
                        setForm({ ...form, senderReceiver: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="">Select</option>
                      <option value="sender">Sender</option>
                      <option value="receiver">Receiver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Vendor Status</label>
                    <select
                      value={String(form.vendorStatus)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          vendorStatus: e.target.value === "true",
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="true">ACTIVE</option>
                      <option value="false">CLOSED</option>
                    </select>
                  </div>
                </div>

                {/* Billing Date, Reminder Type, Before Days */}
                <div className={`grid grid-cols-1 sm:grid-cols-${form.reminderType === "BEFORE_DAYS" ? "3" : "2"} gap-3`}>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Billing Date *</label>
                    <input
                      type="datetime-local"
                      value={form.billingDate}
                      onChange={(e) =>
                        setForm({ ...form, billingDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Reminder Type</label>
                    <select
                      value={form.reminderType}
                      onChange={(e) =>
                        setForm({ ...form, reminderType: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="BEFORE_DAYS">BEFORE_DAYS</option>
                      <option value="WEEKLY">WEEKLY</option>
                    </select>
                  </div>
                  {form.reminderType === "BEFORE_DAYS" && (
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-100">Before Days (0–30)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={form.beforeDays}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            beforeDays: Math.max(
                              0,
                              Math.min(30, Number(e.target.value || 0))
                            ),
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                      />
                    </div>
                  )}
                </div>

                {/* Time of Reminder & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Time of Reminder</label>
                    <input
                      type="time"
                      value={form.timeOfDay}
                      onChange={(e) =>
                        setForm({ ...form, timeOfDay: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Description</label>
                    <textarea
                      placeholder="Enter description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={1}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base resize-vertical"
                    />
                  </div>
                </div>

                {/* Payment Status, Payment Month, Payment Slip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-100">Payment Status</label>
                    <select
                      value={form.paymentStatus}
                      onChange={(e) =>
                        setForm({ ...form, paymentStatus: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>

                  {form.paymentStatus === "PAID" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-100">Payment Month *</label>
                        <input
                          type="month"
                          value={form.paymentMonth}
                          onChange={(e) =>
                            setForm({ ...form, paymentMonth: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-100">Upload Payment Slip *</label>
                        <input
                          type="file"
                          multiple
                          onChange={(e) =>
                            setSlipFiles(
                              e.target.files ? Array.from(e.target.files) : []
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 dark:bg-gray-700 dark:text-white text-base file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-between items-center">

                {(form?.payment?.filter((p) => p.slip?.length > 0).length ?? 0) > 0 && (
                  <Button
                    onClick={() => handlePaySlipModal(form.payment)}
                    variant="primary"
                    size="sm"
                    disabled={loading}
                    className="w-full sm:w-auto justify-center order-first sm:order-none"
                  >
                    Click to See PaySlip
                  </Button>
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    onClick={reset}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="w-full sm:w-auto justify-center"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="sm"
                    disabled={loading}
                    className="w-full sm:w-auto justify-center"
                  >
                    {loading ? "Saving..." : (isEdit ? "Update" : "Create")}
                  </Button>
                </div>




              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PaySlipModal
        open={showPaySlipModal}
        onClose={() => setShowPaySlipModal(false)}
        payment={selectedPayment}
      />

    </>
  );
}