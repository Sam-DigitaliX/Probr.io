"use client";

import { Users, Globe, Activity, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
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
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Sites",
      value: totalSites,
      icon: Globe,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Probes actives",
      value: totalProbes,
      icon: Activity,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Alertes",
      value: activeAlerts,
      icon: Bell,
      color: activeAlerts > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: activeAlerts > 0 ? "bg-destructive/10" : "bg-muted",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "group rounded-xl border border-white/50 bg-white/50 backdrop-blur-xl p-5 shadow-glass transition-all duration-200 hover:shadow-glass-hover hover:-translate-y-0.5 hover:bg-white/65 animate-fade-in-up",
            `animate-delay-${(i + 1) * 100}`
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.bgColor)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
