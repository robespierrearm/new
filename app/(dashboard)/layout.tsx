import { Suspense } from 'react';
import { AppSidebar } from '@/components/AppSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={
        <div className="w-64 border-r bg-white shadow-lg">
          <div className="flex h-20 items-center justify-center border-b bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
            <div className="animate-pulse w-10 h-10 bg-white/20 rounded-xl"></div>
          </div>
        </div>
      }>
        <AppSidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto bg-gray-50 md:ml-0">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
