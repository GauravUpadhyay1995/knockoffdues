// app/api/payments/revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import {Payment} from "@/models/Payment";
import dayjs from "dayjs";

export async function GET(req: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!from || !to) {
            return NextResponse.json({ error: "Missing from or to date" }, { status: 400 });
        }

        const startDate = new Date(from);
        const endDate = new Date(to);

        // Fetch payments within date range
        const payments = await Payment.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        // Aggregate revenue by month
        const revenueByMonth: Record<string, number> = {};

        payments.forEach((p) => {
            const month = dayjs(p.createdAt).format("MMM"); // Jan, Feb, ...
            revenueByMonth[month] = (revenueByMonth[month] || 0) + p.amount;
        });

        // Ensure all months in range are included, even if 0 revenue
        const months = [];
        let cursor = dayjs(startDate);
        const end = dayjs(endDate);
        while (cursor.isBefore(end) || cursor.isSame(end, "month")) {
            months.push(cursor.format("MMM"));
            cursor = cursor.add(1, "month");
        }

        const result = months.map((month) => ({
            month,
            revenue: revenueByMonth[month] || 0,
        }));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Revenue API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
