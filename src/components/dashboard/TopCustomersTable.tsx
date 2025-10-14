"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Props {
  dateRange: { startDate: Date; endDate: Date } | null;
}

export default function TopCustomersTable({ dateRange }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dateRange) return;
    const fetchData = async () => {
      setLoading(true);
      const from = dateRange.startDate.toISOString();
      const to = dateRange.endDate.toISOString();

      try {
        const res = await fetch(`/api/v1/dashboard/top-customers?from=${from}&to=${to}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch top customers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Inline Skeleton
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-3">Top 10 Customers</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Sr. No.</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Customer Id</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Name</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Mobile</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Total Paid</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Outstanding</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500">Last Payment</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8 my-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 my-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 my-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 my-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 my-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 my-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 my-2" /></TableCell>
                  </TableRow>
                ))
              : data.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell className="px-5 py-3 text-gray-600">{i + 1}</TableCell>
                    <TableCell className="px-5 py-3 text-gray-600">{c.id}</TableCell>
                    <TableCell className="px-5 py-3 text-gray-600">{c.name}</TableCell>
                    <TableCell className="px-5 py-3 text-gray-600">{c.mobile}</TableCell>
                    <TableCell className="px-5 py-3 text-gray-600">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {c.total}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600">
                      {c.due ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {c.due}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600">{c.lastPayment}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
