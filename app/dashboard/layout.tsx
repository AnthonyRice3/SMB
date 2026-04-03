import type { Metadata } from "next";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard — SAGAH",
  description: "Your SAGAH business dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-[#07070e]">{children}</main>
    </div>
  );
}
