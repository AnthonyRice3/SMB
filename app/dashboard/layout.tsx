import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard — SAGAH",
  description: "Your SAGAH business dashboard",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex-1 flex overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-[#07070e] pt-14 md:pt-0">{children}</main>
    </div>
  );
}
