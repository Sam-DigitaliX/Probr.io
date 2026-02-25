"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 lg:ml-[240px] pb-[72px] lg:pb-0">
        {children}
      </main>
    </>
  );
}
