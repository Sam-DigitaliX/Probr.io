"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ClientStatusGrid } from "@/components/dashboard/client-status-grid";
import { AlertsFeed } from "@/components/dashboard/alerts-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboard, alerts as alertsApi } from "@/lib/api";
import type { DashboardOverview, Alert } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import { OrbitLoader } from "@/components/ui/orbit-loader";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [overview, allAlerts] = await Promise.all([
        dashboard.overview(),
        alertsApi.list(),
      ]);
      setData(overview);
      setRecentAlerts(allAlerts.filter((a) => !a.is_resolved).slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleResolveAlert = async (id: number) => {
    try {
      await alertsApi.resolve(id);
      setRecentAlerts((prev) => prev.filter((a) => a.id !== id));
      if (data) {
        setData({ ...data, active_alerts: Math.max(0, data.active_alerts - 1) });
      }
    } catch {
      // ignore
    }
  };

  if (loading && !data) {
    return <OrbitLoader />;
  }

  if (error && !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your monitoring infrastructure"
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Stats */}
        <StatsCards
          totalClients={data?.total_clients ?? 0}
          totalSites={data?.total_sites ?? 0}
          totalProbes={data?.total_probes ?? 0}
          activeAlerts={data?.active_alerts ?? 0}
        />

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Client status — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Client Status</h2>
              <Badge variant="outline" className="font-mono text-xs">
                Auto-refresh 30s
              </Badge>
            </div>
            <ClientStatusGrid clients={data?.clients ?? []} />
          </div>

          {/* Alerts feed — 1 col */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Alerts</CardTitle>
                {recentAlerts.length > 0 && (
                  <Badge variant="destructive">{recentAlerts.length}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AlertsFeed alerts={recentAlerts} onResolve={handleResolveAlert} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
