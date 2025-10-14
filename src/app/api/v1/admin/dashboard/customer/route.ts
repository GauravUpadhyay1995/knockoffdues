// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Customer } from "@/models/Customer";
import { Payment } from "@/models/Payment";
import { Withdrawal } from "@/models/Withdraw";
// import dayjs from "dayjs"; // Retain or remove as necessary

// Helper function to safely process the aggregation results
function getSum(results: any[], defaultVal: number = 0, field: string) {
    if (results.length > 0 && results[0][field] !== undefined) {
        return results[0][field];
    }
    return defaultVal;
}

export async function GET(req: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(req.url);
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");

        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (fromParam && toParam) {
            startDate = new Date(fromParam);
            // Ensure end date includes the entire day
            const endOfDay = new Date(toParam);
            endOfDay.setHours(23, 59, 59, 999);
            endDate = endOfDay;
        }


        // --- 0. Withdraw Counts (One Query using $facet) ---
        const allTimeWithdrawStats = await Withdrawal.aggregate([
            {
                $group: {
                    _id: null,
                    totalWithdraws: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0] } },
                    pendingWithdraws: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] }
                    },
                    rejectedWithdraws: {
                        $sum: { $cond: [{ $eq: ["$status", "rejected"] }, "$amount", 0] }
                    },
                    processingWithdraws: {
                        $sum: { $cond: [{ $eq: ["$status", "processing"] }, "$amount", 0] }
                    },

                }
            }
        ]);

        const totalWithdraws = getSum(allTimeWithdrawStats, 0, 'totalWithdraws');
        const pendingWithdraws = getSum(allTimeWithdrawStats, 0, 'pendingWithdraws');
        const rejectedWithdraws = getSum(allTimeWithdrawStats, 0, 'rejectedWithdraws');
        const processingWithdraws = getSum(allTimeWithdrawStats, 0, 'processingWithdraws');

        // --- 1. Customer Counts (One Query using $facet) ---
        const customerCounts = await Customer.aggregate([
            {
                $facet: {
                    totalCustomers: [
                        { $count: "count" }
                    ],
                    totalActiveCustomers: [
                        { $match: { isActive: true } },
                        { $count: "count" }
                    ],
                    // New Customers in Range (Only if dates are provided)
                    ...(startDate && endDate && {
                        monthlyTotalCustomers: [
                            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                            { $count: "count" }
                        ]
                    })
                }
            }
        ]);

        const totalCustomers = customerCounts[0].totalCustomers[0]?.count || 0;
        const totalActiveCustomers = customerCounts[0].totalActiveCustomers[0]?.count || 0;
        const monthlyTotalCustomers = customerCounts[0].monthlyTotalCustomers ? customerCounts[0].monthlyTotalCustomers[0]?.count || 0 : 0;

        // --- 2. All-Time Payment Aggregation (One Query) ---
        const allTimePaymentStats = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, "$amount", 0] } },
                    pendingDues: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$isApproved", false] }, { $eq: ["$isRejected", false] }] },
                                "$amount",
                                0
                            ]
                        }
                    },
                    rejectedDues: {
                        $sum: { $cond: [{ $eq: ["$isRejected", true] }, "$amount", 0] }
                    },
                    // 💡 NEW: All-Time Welcome Payment Sum
                    welcomePaymentAllTime: {
                        $sum: { $cond: [{ $eq: ["$transactionId", "Welcome"] }, "$amount", 0] }
                    }
                }
            }
        ]);

        const totalPayments = getSum(allTimePaymentStats, 0, 'totalPayments');
        const pendingDues = getSum(allTimePaymentStats, 0, 'pendingDues');
        const rejectedDues = getSum(allTimePaymentStats, 0, 'rejectedDues');
        const approvedPayments = totalPayments - pendingDues - rejectedDues;
        const welcomePaymentAllTime = getSum(allTimePaymentStats, 0, 'welcomePaymentAllTime');


        // --- 3. Payments In Date Range (One Query, Conditional) ---
        let paymentsThisMonth = 0;
        let approvedPaymentsThisMonth = 0;
        let rejectedPaymentsThisMonth = 0;
        let pendingPaymentsThisMonth = 0;
        let welcomePaymentInRange = 0;



        if (startDate && endDate) {
            const dateRangePaymentStats = await Payment.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, "$amount", 0] } },

                        approvedAmount: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, "$amount", 0] } },
                        rejectedAmount: { $sum: { $cond: [{ $eq: ["$isRejected", true] }, "$amount", 0] } },
                        pendingAmount: { $sum: { $cond: [{ $and: [{ $eq: ["$isApproved", false] }, { $eq: ["$isRejected", false] }] }, "$amount", 0] } },
                        // 💡 NEW: Date-Range Welcome Payment Sum
                        welcomeAmount: { $sum: { $cond: [{ $eq: ["$transactionId", "Welcome"] }, "$amount", 0] } }
                    }
                }
            ]);

            paymentsThisMonth = getSum(dateRangePaymentStats, 0, 'totalAmount');
            approvedPaymentsThisMonth = getSum(dateRangePaymentStats, 0, 'approvedAmount');
            rejectedPaymentsThisMonth = getSum(dateRangePaymentStats, 0, 'rejectedAmount');
            pendingPaymentsThisMonth = getSum(dateRangePaymentStats, 0, 'pendingAmount');
            welcomePaymentInRange = getSum(dateRangePaymentStats, 0, 'welcomeAmount');
        }


        // --- 4. Withdraw In Date Range (One Query, Conditional) ---
        let withdrawsThisMonth = 0;
        let rejectedWithdrawsThisMonth = 0;
        let pendingWithdrawsThisMonth = 0;
        let processingWithdrawsThisMonth = 0;


        if (startDate && endDate) {
            const dateRangeWithdrawsStats = await Withdrawal.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: null,
                        totalWithdraws: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0] } },
                        rejectedWithdraws: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, "$amount", 0] } },
                        pendingWithdraws: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] } },
                        processingWithdraws: { $sum: { $cond: [{ $eq: ["$status", "processing"] }, "$amount", 0] } }
                    }
                }
            ]);

            withdrawsThisMonth = getSum(dateRangeWithdrawsStats, 0, 'totalWithdraws');
            rejectedWithdrawsThisMonth = getSum(dateRangeWithdrawsStats, 0, 'rejectedWithdraws');
            pendingWithdrawsThisMonth = getSum(dateRangeWithdrawsStats, 0, 'pendingWithdraws');
            processingWithdrawsThisMonth = getSum(dateRangeWithdrawsStats, 0, 'processingWithdraws');
        }


        const stats = [
            { title: "Total Customers", value: totalCustomers.toString(), icon: "👥" },
            { title: "Active Customers", value: totalActiveCustomers.toString(), icon: "🟢" },
            { title: "InActive Customers", value: (totalCustomers - totalActiveCustomers).toString(), icon: "🔴" },

            { title: "Total Payments (All Time)", value: `₹${totalPayments.toLocaleString()}`, icon: "💰" },
            // { title: "Approved Payments (All Time)", value: `₹${approvedPayments.toLocaleString()}`, icon: "✅" },
            { title: "Pending Payments (All Time)", value: `₹${pendingDues.toLocaleString()}`, icon: "⚠️" },
            { title: "Rejected Payments (All Time)", value: `₹${rejectedDues.toLocaleString()}`, icon: "❌" },
            // 💡 NEW ALL-TIME STAT
            { title: "Welcome Payments (All Time)", value: `₹${welcomePaymentAllTime.toLocaleString()}`, icon: "🎁" },

            { title: "Total New Customers in Range", value: monthlyTotalCustomers.toString(), icon: "👤" },
            { title: "Total Payments in Range", value: `₹${paymentsThisMonth.toLocaleString()}`, icon: "📅" },
            // { title: "Approved Payments in Range", value: `₹${approvedPaymentsThisMonth.toLocaleString()}`, icon: "👍" },
            { title: "Rejected Payments in Range", value: `₹${rejectedPaymentsThisMonth.toLocaleString()}`, icon: "👎" },
            { title: "Pending Payments in Range", value: `₹${pendingPaymentsThisMonth.toLocaleString()}`, icon: "🕒" },
            // 💡 NEW DATE-RANGE STAT
            { title: "Welcome Payments in Range", value: `₹${welcomePaymentInRange.toLocaleString()}`, icon: "🎉" },

            //withdraws all time
            { title: "Total Approved Withdraw (All Time)", value: `₹${totalWithdraws.toLocaleString()}`, icon: "🎉" },
            { title: "Total Pending Withdraw (All Time)", value: `₹${pendingWithdraws.toLocaleString()}`, icon: "🎉" },
            { title: "Total Rejected Withdraw (All Time)", value: `₹${rejectedWithdraws.toLocaleString()}`, icon: "🎉" },
            { title: "Total Processing Withdraw (All Time)", value: `₹${processingWithdraws.toLocaleString()}`, icon: "🎉" },

            //withdraws date filter
            { title: "Total Approved Withdraw in Range", value: `₹${withdrawsThisMonth.toLocaleString()}`, icon: "🎉" },
            { title: "Total Pending Withdraw in Range", value: `₹${pendingWithdrawsThisMonth.toLocaleString()}`, icon: "🎉" },
            { title: "Total Rejected Withdraw in Range", value: `₹${rejectedWithdrawsThisMonth.toLocaleString()}`, icon: "🎉" },
            { title: "Total Processing Withdraw in Range", value: `₹${processingWithdrawsThisMonth.toLocaleString()}`, icon: "🎉" },

        ];

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error("Dashboard Stats API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}