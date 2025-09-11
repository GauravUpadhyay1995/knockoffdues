import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventsTable from "@/components/tables/EventsTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Event List | Knock Off Dues",
  description: "Event List",
};

export default async function GalleriesTables() {
  // Get all cookies and format them into a header string
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore).getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/list`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const result = await res.json();
  const GalleriesData = result?.data?.events || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Event List" />
      <div className="space-y-6">
        <EventsTable initialData={GalleriesData} />
      </div>
    </div>
  );
}
