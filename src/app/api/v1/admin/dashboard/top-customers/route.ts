// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Customer } from "@/models/Customer";
import { Payment } from "@/models/Payment";
import { getTopCustomersPipeline, TopCustomerResult } from '@/utils/paymentAggregation';
interface TopCustomersResponse {
    name: string;
    total: string;
    due: string;
    lastPayment: string;
}

// Format currency in Indian Rupees
const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Format date as DD-MMM-YYYY
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};
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
            endDate = new Date(toParam);
        }

        // Get aggregation pipeline
        const pipeline = getTopCustomersPipeline(startDate, endDate);

        // Execute aggregation
        const topCustomers: TopCustomerResult[] = await Payment.aggregate(pipeline);

        // Format the response
        const formattedCustomers: TopCustomersResponse[] = topCustomers.map(customer => ({
            id: customer._id,
            name: customer.name,
            mobile: customer.mobile,
            total: formatINR(customer.totalAmount),
            due: formatINR(customer.dueAmount),
            lastPayment: formatDate(customer.lastPaymentDate)
        }));

        return NextResponse.json(formattedCustomers);
    } catch (error: any) {
        console.error("Dashboard Top Customers API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}
