'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-black text-neutral-300">
        <AppSidebar />
        <div className="relative flex w-full flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col p-4 sm:p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
} 