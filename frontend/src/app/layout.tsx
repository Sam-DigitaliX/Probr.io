import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackGuard — Client Monitoring",
  description: "Real-time monitoring dashboard for tracking infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <Sidebar />
        <main className="ml-[240px] min-h-screen transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
