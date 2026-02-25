"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { alerts as alertsApi, sites as sitesApi } from "@/lib/api";
import type { Alert, Site } from "@/lib/types";
import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { formatRelative } from "@/lib/utils";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSite, setFilterSite] = useState<number | undefined>();
  const [filterResolved, setFilterResolved] = useState<string>("active");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsData, sitesData] = await Promise.all([
        alertsApi.list(filterSite),
        sitesApi.list(),
      ]);
      setAlerts(alertsData);
      setSites(sitesData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterSite]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (id: number) => {
    try {
      await alertsApi.resolve(id);
      fetchData();
    } catch {
      // ignore
    }
  };

  const siteName = (siteId: number) =>
    sites.find((s) => s.id === siteId)?.name ?? `Site #${siteId}`;

  const filteredAlerts = alerts.filter((a) => {
    if (filterResolved === "active") return !a.is_resolved;
    if (filterResolved === "resolved") return a.is_resolved;
    return true;
  });

  if (loading && alerts.length === 0) {
    return <OrbitLoader />;
  }

  return (
    <>
      <Header title="Alerts" description="Monitor and resolve alerts" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Summary badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-glass-border bg-glass shadow-sm px-3 sm:px-4 py-2">
            <AlertTriangle className="h-4 w-4 icon-grad" />
            <span className="text-sm font-medium">
              {alerts.filter((a) => !a.is_resolved && a.severity === "critical").length} critical
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-glass-border bg-glass shadow-sm px-3 sm:px-4 py-2">
            <AlertTriangle className="h-4 w-4 icon-grad" />
            <span className="text-sm font-medium">
              {alerts.filter((a) => !a.is_resolved && a.severity === "warning").length} warnings
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-glass-border bg-glass shadow-sm px-3 sm:px-4 py-2">
            <CheckCircle2 className="h-4 w-4 icon-grad" />
            <span className="text-sm font-medium">
              {alerts.filter((a) => a.is_resolved).length} resolved
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Select
            value={filterSite ?? ""}
            onChange={(e) => setFilterSite(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full sm:w-[220px]"
          >
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="w-full sm:w-[160px]"
          >
            <option value="active">Active only</option>
            <option value="resolved">Resolved only</option>
            <option value="all">All alerts</option>
          </Select>
        </div>

        {filteredAlerts.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7 icon-grad" />}
            title={filterResolved === "active" ? "No active alerts" : "No alerts found"}
            description={
              filterResolved === "active"
                ? "All systems are running smoothly."
                : "No alerts match your current filters."
            }
          />
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="space-y-3 md:hidden">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <StatusDot
                      status={alert.is_resolved ? "ok" : alert.severity === "critical" ? "critical" : "warning"}
                      pulse={!alert.is_resolved}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                    </div>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "warning"} className="shrink-0">
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{siteName(alert.site_id)}</span>
                    <span>·</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{alert.probe_type}</Badge>
                    <span>·</span>
                    <span>{formatRelative(alert.created_at)}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    {!alert.is_resolved ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleResolve(alert.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 icon-grad" />
                        Resolve
                      </Button>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Alert</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Probe</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <StatusDot
                            status={alert.is_resolved ? "ok" : alert.severity === "critical" ? "critical" : "warning"}
                            pulse={!alert.is_resolved}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{alert.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {alert.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {siteName(alert.site_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {alert.probe_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={alert.severity === "critical" ? "destructive" : "warning"}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatRelative(alert.created_at)}
                        </TableCell>
                        <TableCell>
                          {!alert.is_resolved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 icon-grad" />
                              Resolve
                            </Button>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              Resolved
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
