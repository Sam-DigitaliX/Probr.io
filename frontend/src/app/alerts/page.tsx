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
import { Bell, CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
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
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header title="Alerts" description="Monitor and resolve alerts" />

      <div className="p-8 space-y-6">
        {/* Summary badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">
              {alerts.filter((a) => !a.is_resolved && a.severity === "critical").length} critical
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">
              {alerts.filter((a) => !a.is_resolved && a.severity === "warning").length} warnings
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">
              {alerts.filter((a) => a.is_resolved).length} resolved
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            value={filterSite ?? ""}
            onChange={(e) => setFilterSite(e.target.value ? Number(e.target.value) : undefined)}
            className="w-[220px]"
          >
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="w-[160px]"
          >
            <option value="active">Active only</option>
            <option value="resolved">Resolved only</option>
            <option value="all">All alerts</option>
          </Select>
        </div>

        {filteredAlerts.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7" />}
            title={filterResolved === "active" ? "No active alerts" : "No alerts found"}
            description={
              filterResolved === "active"
                ? "All systems are running smoothly."
                : "No alerts match your current filters."
            }
          />
        ) : (
          <Card>
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
                            <CheckCircle2 className="h-3.5 w-3.5" />
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
        )}
      </div>
    </>
  );
}
