"use client";

import { Users, Globe, Activity, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
  bgColor: string;
}

interface StatsCardsProps {
  totalClients: number;
  totalSites: number;
  totalProbes: number;
  activeAlerts: number;
}

export function StatsCards({ totalClients, totalSites, totalProbes, activeAlerts }: StatsCardsProps) {
  const stats: Stat[] = [
    {
      label: "Clients",
      value: totalClients,
      icon: Users,
      bgColor: "bg-white/[0.04]",
    },
    {
      label: "Sites",
      value: totalSites,
      icon: Globe,
      bgColor: "bg-white/[0.04]",
    },
    {
      label: "Probes actives",
      value: totalProbes,
      icon: Activity,
      bgColor: "bg-white/[0.04]",
    },
    {
      label: "Alertes",
      value: activeAlerts,
      icon: Bell,
      bgColor: activeAlerts > 0 ? "bg-destructive/10" : "bg-white/[0.04]",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "glass-card-interactive p-5 animate-fade-in-up",
            `animate-delay-${(i + 1) * 100}`
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06]", stat.bgColor)}>
              <stat.icon className="h-5 w-5 icon-grad" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
