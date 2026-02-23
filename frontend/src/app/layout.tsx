import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
