"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Globe,
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/sites", label: "Sites", icon: Globe },
  { href: "/dashboard/probes", label: "Probes", icon: Activity },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col",
          "bg-glass backdrop-blur-xl border-r border-glass-border",
          "shadow-card transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Image
              src="/images/Probr_logo.webp"
              alt="Probr"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-gradient-primary">
                Probr
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Monitoring
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm border border-black/[0.04]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-sidebar-primary")}
                />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden flex items-center justify-around bg-glass backdrop-blur-xl border-t border-glass-border safe-area-bottom">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1 transition-colors duration-200",
                isActive
                  ? "text-sidebar-primary"
                  : "text-muted-foreground active:text-sidebar-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
