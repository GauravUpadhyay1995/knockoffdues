import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VenderTable from "@/components/tables/VendersTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Vendor List | Knock Off Dues",
  description: "Vendor List",
};

export default async function GalleriesTables() {
  // Get all cookies and format them into a header string
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore).getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reminders/create`, {

    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const result = await res.json();
  const GalleriesData = result?.data || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Venders Management" />
      <div className="space-y-6">
        <VenderTable initialData={GalleriesData} />
      </div>
    </div>
  );
}
