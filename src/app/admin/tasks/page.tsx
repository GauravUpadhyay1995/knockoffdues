import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaskList from "@/components/tables/TaskListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Tasks List | Knock Off Dues",
    description: "Tasks List",
};

export default async function UsersTables() {
    // ✅ Properly extract and format cookies for API auth
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/list?perPage=All`, {
        headers: {
            Cookie: cookieHeader,
        },
        cache: 'no-store', // ensures fresh server data
    });

    const result = await res.json();
    const taskssData = result?.data?.tasks || [];

    return (
        <div>
            <PageBreadcrumb pageTitle="Task Management" />
            <div className="space-y-6">
                <TaskList initialData={taskssData} />
            </div>
        </div>
    );
}
