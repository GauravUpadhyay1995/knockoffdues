import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditUser from "@/components/common/EditUser";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Employee Update | Knock Off Dues",
    description: "Employee Update",
};

export default async function UsersTables() {


    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Employee" />
            <div className="space-y-6">
                <EditUser />
            </div>
        </div>
    );
}
