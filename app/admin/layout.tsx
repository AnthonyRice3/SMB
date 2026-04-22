import type { Metadata } from 'next';
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Sidebar from '../../components/admin/Sidebar';

export const metadata: Metadata = {
  title: 'Admin — SAGAH',
  description: 'SAGAH admin panel',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string } | null)?.role;
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#07070e] pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
