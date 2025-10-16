import { AppSidebar } from '@/components/AppSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 md:ml-0">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
