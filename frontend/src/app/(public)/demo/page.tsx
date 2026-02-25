"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Globe,
  Activity,
  Bell,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  Server,
  Tag,
  Eye,
  Database,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  demoOverview,
  demoAlerts,
  demoTagHealth,
  demoEventVolumes,
  demoUserDataQuality,
  demoHourlyEvents,
  demoProbeTimeline,
} from "@/lib/demo-data";
import type { ProbeTimelineEntry } from "@/lib/demo-data";

/* ═══════════════════════════════════════════════════
   DEMO DASHBOARD — Standalone page with mock data
   ═══════════════════════════════════════════════════ */

type DemoTab = "overview" | "monitoring";

/* ── Probe type icons ─────────────────────────────── */
const probeIcon: Record<string, React.ElementType> = {
  http_health: Server,
  sgtm_infra: Server,
  gtm_version: Tag,
  data_volume: BarChart3,
  bq_events: Database,
  tag_check: Eye,
  cmp_check: Shield,
};

const probeLabel: Record<string, string> = {
  http_health: "HTTP Health",
  sgtm_infra: "sGTM Infra",
  gtm_version: "GTM Version",
  data_volume: "Data Volume",
  bq_events: "BQ Events",
  tag_check: "Tag Check",
  cmp_check: "CMP Check",
};

const statusDotColor: Record<string, string> = {
  ok: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-red-500",
  error: "bg-red-500",
};

const statusBadge = (status: string) => {
  switch (status) {
    case "ok":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "critical":
    case "error":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
};

const statusLabel: Record<string, string> = {
  ok: "Healthy",
  warning: "Warning",
  critical: "Critical",
  error: "Error",
};

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("overview");
  const [resolvedAlerts, setResolvedAlerts] = useState<number[]>([]);

  const unresolvedAlerts = demoAlerts.filter(
    (a) => !a.is_resolved && !resolvedAlerts.includes(a.id)
  );

  const handleResolve = (id: number) => {
    setResolvedAlerts((prev) => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col w-[240px] bg-background/80 backdrop-blur-xl border-r border-white/[0.06] shadow-2xl shadow-black/20">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Image
              src="/images/Probr_logo.webp"
              alt="Probr"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-gradient-primary">
              Probr
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              Demo
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {[
            { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
            { id: "monitoring" as const, label: "Monitoring", icon: Activity },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-white/[0.06] text-white shadow-sm border border-white/[0.08]"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  activeTab === item.id ? "icon-grad" : "text-white/40"
                )}
              />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-br from-primary via-accent to-secondary" />
              )}
            </button>
          ))}

          {/* Simulated nav items (disabled) */}
          {[
            { label: "Clients", icon: Users },
            { label: "Sites", icon: Globe },
            { label: "Probes", icon: Activity },
            { label: "Alerts", icon: Bell },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/20 cursor-not-allowed"
            >
              <item.icon className="h-[18px] w-[18px] shrink-0 text-white/15" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Back to site */}
        <div className="border-t border-white/[0.06] p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/[0.04] hover:text-white/80 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="min-h-screen transition-all duration-300 lg:ml-[240px] pb-24 lg:pb-0">
        {/* Demo banner */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 border-b border-white/[0.06] px-4 py-2.5 text-center">
          <p className="text-xs sm:text-sm font-medium text-white/80">
            <Zap className="inline h-3.5 w-3.5 mr-1 text-amber-400" />
            Mode d&eacute;mo &mdash; Donn&eacute;es fictives pour illustration.{" "}
            <Link href="/signup" className="underline text-primary hover:text-primary/80 font-semibold">
              Cr&eacute;er un compte
            </Link>{" "}
            pour monitorer vos vrais clients.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] bg-background/60 backdrop-blur-xl px-4 py-4 sm:px-8 sm:py-5 sticky top-0 z-20">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {activeTab === "overview" ? "Dashboard" : "Monitoring"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground truncate">
              {activeTab === "overview"
                ? "Vue d'ensemble de votre infrastructure tracking"
                : "Analyse en temps r\u00e9el des donn\u00e9es collect\u00e9es via le Probr Listener"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile tab switcher */}
            <div className="flex lg:hidden rounded-lg border border-white/[0.08] overflow-hidden">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === "overview" ? "bg-white/10 text-white" : "text-white/50"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("monitoring")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === "monitoring" ? "bg-white/10 text-white" : "text-white/50"
                )}
              >
                Monitoring
              </button>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold text-white/60">
              Auto-refresh 30s
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {activeTab === "overview" ? (
            <OverviewTab
              unresolvedAlerts={unresolvedAlerts}
              onResolve={handleResolve}
            />
          ) : (
            <MonitoringTab />
          )}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden flex items-center justify-around bg-background/80 backdrop-blur-xl border-t border-white/[0.06]">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1 transition-colors duration-200",
            activeTab === "overview" ? "text-white" : "text-white/40"
          )}
        >
          <LayoutDashboard className={cn("h-5 w-5", activeTab === "overview" && "icon-grad")} />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("monitoring")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1 transition-colors duration-200",
            activeTab === "monitoring" ? "text-white" : "text-white/40"
          )}
        >
          <Activity className={cn("h-5 w-5", activeTab === "monitoring" && "icon-grad")} />
          <span className="text-[10px] font-medium">Monitoring</span>
        </button>
        <Link
          href="/"
          className="flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1 text-white/40"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-[10px] font-medium">Retour</span>
        </Link>
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════ */

function OverviewTab({
  unresolvedAlerts,
  onResolve,
}: {
  unresolvedAlerts: typeof demoAlerts;
  onResolve: (id: number) => void;
}) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Clients", value: demoOverview.total_clients, icon: Users, accent: false },
          { label: "Sites", value: demoOverview.total_sites, icon: Globe, accent: false },
          { label: "Probes actives", value: demoOverview.total_probes, icon: Activity, accent: false },
          { label: "Alertes", value: unresolvedAlerts.length, icon: Bell, accent: unresolvedAlerts.length > 0 },
        ].map((stat, i) => (
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
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06]",
                  stat.accent ? "bg-red-500/10" : "bg-white/[0.04]"
                )}
              >
                <stat.icon className="h-5 w-5 icon-grad" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Status — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Client Status</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {demoOverview.clients.map((client, i) => (
              <div
                key={client.client_id}
                className={cn(
                  "glass-card-interactive p-5 animate-fade-in-up",
                  `animate-delay-${((i % 6) + 1) * 100}`
                )}
              >
                {/* Client Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="relative inline-flex">
                      {(client.worst_status === "critical" || client.worst_status === "error") && (
                        <span
                          className={cn(
                            "absolute inline-flex h-3 w-3 rounded-full animate-ping opacity-75",
                            statusDotColor[client.worst_status] + "/40"
                          )}
                        />
                      )}
                      <span className={cn("relative inline-flex h-3 w-3 rounded-full", statusDotColor[client.worst_status])} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm">{client.client_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {client.sites.length} site{client.sites.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      statusBadge(client.worst_status)
                    )}
                  >
                    {statusLabel[client.worst_status]}
                  </span>
                </div>

                {/* Sites */}
                <div className="space-y-2">
                  {client.sites.slice(0, 3).map((site) => (
                    <div
                      key={site.site_id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.06] px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("inline-flex h-2 w-2 rounded-full", statusDotColor[site.worst_status])} />
                        <span className="font-medium truncate">{site.site_name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {site.active_alerts > 0 && (
                          <span className="inline-flex items-center rounded-full border border-transparent bg-red-500/10 text-red-400 px-1.5 py-0 text-[10px] font-semibold">
                            {site.active_alerts}
                          </span>
                        )}
                        <ExternalLink className="h-3 w-3 icon-grad" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-1 mt-4 pt-3 border-t border-white/[0.06] text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  View details
                  <ChevronRight className="h-3 w-3 icon-grad" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Feed — 1 col */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-lg">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold leading-none tracking-tight">Active Alerts</h3>
              {unresolvedAlerts.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-transparent bg-red-500/10 text-red-400 px-2.5 py-0.5 text-xs font-semibold">
                  {unresolvedAlerts.length}
                </span>
              )}
            </div>
          </div>
          <div className="p-6 pt-0">
            {unresolvedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 mb-2 icon-grad" />
                <p className="text-sm font-medium">All clear</p>
                <p className="text-xs text-muted-foreground">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unresolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="mt-0.5">
                      <AlertTriangle
                        className={cn(
                          "h-4 w-4",
                          alert.severity === "critical" ? "text-red-400" : "text-amber-400"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{alert.title}</p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-semibold shrink-0",
                            alert.severity === "critical"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {Math.round((Date.now() - new Date(alert.created_at).getTime()) / 60000)}m ago
                      </p>
                    </div>
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="shrink-0 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/[0.06] rounded-md px-2 py-1 transition-all"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Probe Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Probe Timeline</h2>
          <span className="text-xs text-muted-foreground">Derni&egrave;res ex&eacute;cutions</span>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Probe</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Message</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Latency</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {demoProbeTimeline.map((entry, i) => {
                  const Icon = probeIcon[entry.probeType] ?? Activity;
                  return (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex h-2.5 w-2.5 rounded-full", statusDotColor[entry.status])} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-xs">{probeLabel[entry.probeType]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{entry.site}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell max-w-[260px] truncate">{entry.message}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground text-right hidden md:table-cell font-mono">
                        {entry.responseMs !== null ? `${entry.responseMs}ms` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground text-right whitespace-nowrap">
                        {Math.round((Date.now() - new Date(entry.time).getTime()) / 60000)}m ago
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   MONITORING TAB
   ═══════════════════════════════════════════════════ */

function MonitoringTab() {
  const maxEvents = Math.max(...demoHourlyEvents.map((h) => h.events));

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">&Eacute;v&eacute;nements (24h)</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {demoEventVolumes.reduce((s, e) => s + e.total_count, 0).toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
              <BarChart3 className="h-5 w-5 icon-grad" />
            </div>
          </div>
        </div>
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tags monitor&eacute;s</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{demoTagHealth.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
              <Tag className="h-5 w-5 icon-grad" />
            </div>
          </div>
        </div>
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate global</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-400">
                {(
                  (demoTagHealth.reduce((s, t) => s + t.success_count, 0) /
                    demoTagHealth.reduce((s, t) => s + t.total_executions, 0)) *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email match rate</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{demoUserDataQuality.email_rate}%</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
              <Users className="h-5 w-5 icon-grad" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Volume Chart + Event Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart — 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Volume d&apos;&eacute;v&eacute;nements (24h)</h3>
            <span className="text-xs text-muted-foreground">Par heure</span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-[3px] h-40 sm:h-48">
            {demoHourlyEvents.map((h, i) => {
              const pct = (h.events / maxEvents) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/95 border border-white/[0.1] rounded-lg px-2 py-1 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {h.hour} — {h.events.toLocaleString("fr-FR")}
                  </div>
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-primary/80 to-accent/60 transition-all duration-200 group-hover:from-primary group-hover:to-accent min-h-[2px]"
                    style={{ height: `${pct}%` }}
                  />
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between text-[9px] text-muted-foreground px-0.5">
            {demoHourlyEvents
              .filter((_, i) => i % 4 === 0)
              .map((h, i) => (
                <span key={i}>{h.hour}</span>
              ))}
          </div>
        </div>

        {/* Event breakdown — 1 col */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 space-y-4">
          <h3 className="font-semibold">Events par type</h3>
          <div className="space-y-3">
            {demoEventVolumes.map((ev) => {
              const maxCount = demoEventVolumes[0].total_count;
              const barWidth = (ev.total_count / maxCount) * 100;
              return (
                <div key={ev.event_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium font-mono">{ev.event_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {ev.total_count.toLocaleString("fr-FR")}
                      </span>
                      {ev.trend_pct !== null && (
                        <span
                          className={cn(
                            "flex items-center text-[10px] font-semibold",
                            ev.trend_pct >= 0 ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {ev.trend_pct >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(ev.trend_pct)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/70 to-accent/50"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tag Health + User Data Quality */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tag Health Table — 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <div className="px-6 pt-6 pb-3">
            <h3 className="font-semibold">Tag Health (server-side)</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Performance des tags server-side via le Probr Listener &mdash; derni&egrave;res 24h
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tag</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ex&eacute;cutions</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Succ&egrave;s</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">&Eacute;checs</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taux</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Latence moy.</th>
                </tr>
              </thead>
              <tbody>
                {demoTagHealth.map((tag) => (
                  <tr key={tag.tag_name} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("inline-flex h-2 w-2 rounded-full", tag.success_rate >= 99.5 ? "bg-emerald-400" : tag.success_rate >= 99 ? "bg-amber-400" : "bg-red-400")} />
                        <span className="font-medium">{tag.tag_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {tag.total_executions.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400 hidden sm:table-cell">
                      {tag.success_count.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-red-400 hidden sm:table-cell">
                      {tag.failure_count.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          tag.success_rate >= 99.5
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : tag.success_rate >= 99
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}
                      >
                        {tag.success_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                      {tag.avg_execution_time_ms}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Data Quality — 1 col */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 space-y-5">
          <div>
            <h3 className="font-semibold">User Data Quality</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Taux de collecte de donn&eacute;es first-party sur {demoUserDataQuality.total_events.toLocaleString("fr-FR")} &eacute;v&eacute;nements
            </p>
          </div>

          {[
            { label: "Email", value: demoUserDataQuality.email_rate, color: "from-blue-500 to-cyan-400" },
            { label: "T\u00e9l\u00e9phone", value: demoUserDataQuality.phone_rate, color: "from-violet-500 to-purple-400" },
            { label: "Adresse", value: demoUserDataQuality.address_rate, color: "from-amber-500 to-orange-400" },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="font-bold">{item.value}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", item.color)}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enrichissez vos conversions avec des donn&eacute;es first-party de qualit&eacute; pour am&eacute;liorer vos performances Meta CAPI et Google Ads Enhanced Conversions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
