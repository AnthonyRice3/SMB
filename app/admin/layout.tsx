import type { Metadata } from 'next';
import Sidebar from '../../components/admin/Sidebar';

export const metadata: Metadata = {
  title: 'Admin — SAGAH',
  description: 'SAGAH admin panel',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#07070e]">
        {children}
      </main>
    </div>
  );
}
