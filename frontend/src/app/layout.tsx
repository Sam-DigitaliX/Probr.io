import type { Metadata } from "next";
import "./globals.css";
import { EvervaultGlow } from "@/components/ui/evervault-glow";

export const metadata: Metadata = {
  title: "TrackGuard — Monitoring Infrastructure",
  description: "Real-time monitoring for your tracking infrastructure (sGTM, GTM, GA4, BigQuery, CMP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <EvervaultGlow />
        <div className="relative z-[1]">
          {children}
        </div>
      </body>
    </html>
  );
}
