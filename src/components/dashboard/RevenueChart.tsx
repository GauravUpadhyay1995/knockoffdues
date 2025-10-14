'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface Props {
    dateRange: { startDate: Date; endDate: Date } | null;
}

export default function RevenueChart({ dateRange }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dateRange) return;
        const fetchData = async () => {
            setLoading(true);
            const from = dateRange.startDate.toISOString();
            const to = dateRange.endDate.toISOString();

            try {
                const res = await fetch(`/api/v1/dashboard/revenue-trend?from=${from}&to=${to}`);
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error('Failed to fetch revenue trend', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    // Skeleton loader bars
    const SkeletonBar = ({ width }: { width: string }) => (
        <div className="flex flex-col justify-end items-center h-full w-full">
            <div className={`animate-pulse bg-gray-200 rounded-t-md ${width}`} style={{ height: `${Math.random() * 100 + 50}px` }} />
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-3">Revenue Trend</h2>

            {loading ? (
                <div className="h-[250px] flex items-end justify-between gap-2 px-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonBar key={i} width="w-8 sm:w-10 md:w-12" />
                    ))}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
