import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DepartmentsTable from "@/components/tables/DepartmentsTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Department List | Knock Off Dues",
    description: "Department List",
};

export default async function GalleriesTables() {
    // Get all cookies and format them into a header string
    const cookieStore = cookies();
    const cookieHeader = (await cookieStore).getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/list?perPage=25`, {
        headers: {
            Cookie: cookieHeader,
        },
        cache: 'no-store',
    });

    const result = await res.json();
    const DepartmentsData = result?.data?.departments || [];

    return (
        <div>
            <PageBreadcrumb pageTitle="Department Management" />
            <div className="space-y-6">
                <DepartmentsTable initialData={DepartmentsData} />
            </div>
        </div>
    );
}
