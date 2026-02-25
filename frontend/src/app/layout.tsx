import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EvervaultGlow } from "@/components/ui/evervault-glow";
import { SvgGradientDefs } from "@/components/ui/gradient-icon";

export const metadata: Metadata = {
  title: "Probr — Monitoring Infrastructure",
  description: "Real-time monitoring for your tracking infrastructure (sGTM, GTM, GA4, BigQuery, CMP)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <SvgGradientDefs />
        <EvervaultGlow />
        <div className="relative z-[1]">
          {children}
        </div>
      </body>
    </html>
  );
}
