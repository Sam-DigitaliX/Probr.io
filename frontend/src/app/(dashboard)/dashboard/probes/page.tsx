"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StatusDot } from "@/components/ui/status-dot";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { probes as probesApi, sites as sitesApi } from "@/lib/api";
import type { ProbeConfig, ProbeCreate, ProbeResult, Site, ProbeType } from "@/lib/types";
import {
  Plus, Activity, Play, Trash2, RefreshCw, Clock, Zap, ChevronDown, ChevronUp,
} from "lucide-react";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { formatRelative, statusBg } from "@/lib/utils";

const PROBE_TYPES: { value: ProbeType; label: string }[] = [
  { value: "http_health", label: "HTTP Health" },
  { value: "sgtm_infra", label: "sGTM Infra" },
  { value: "gtm_version", label: "GTM Version" },
  { value: "data_volume", label: "Data Volume" },
  { value: "bq_events", label: "BQ Events" },
  { value: "tag_check", label: "Tag Check" },
  { value: "cmp_check", label: "CMP Check" },
];

export default function ProbesPage() {
  const [probes, setProbes] = useState<ProbeConfig[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterSite, setFilterSite] = useState<number | undefined>();
  const [form, setForm] = useState<ProbeCreate>({
    site_id: 0,
    probe_type: "http_health",
    interval_seconds: 300,
  });
  const [expandedProbe, setExpandedProbe] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, ProbeResult[]>>({});
  const [runningProbe, setRunningProbe] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [probesData, sitesData] = await Promise.all([
        probesApi.list(filterSite),
        sitesApi.list(),
      ]);
      setProbes(probesData);
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

  const siteName = (siteId: number) =>
    sites.find((s) => s.id === siteId)?.name ?? `Site #${siteId}`;

  const handleCreate = async () => {
    if (!form.site_id) return;
    try {
      await probesApi.create(form);
      setShowCreate(false);
      setForm({ site_id: 0, probe_type: "http_health", interval_seconds: 300 });
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await probesApi.delete(id);
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleRun = async (id: number) => {
    try {
      setRunningProbe(id);
      const result = await probesApi.run(id);
      setResults((prev) => ({ ...prev, [id]: [result, ...(prev[id] ?? [])] }));
      setExpandedProbe(id);
    } catch {
      // ignore
    } finally {
      setRunningProbe(null);
    }
  };

  const toggleExpand = async (id: number) => {
    if (expandedProbe === id) {
      setExpandedProbe(null);
      return;
    }
    setExpandedProbe(id);
    if (!results[id]) {
      try {
        const data = await probesApi.results(id);
        setResults((prev) => ({ ...prev, [id]: data }));
      } catch {
        // ignore
      }
    }
  };

  const probeTypeLabel = (type: string) =>
    PROBE_TYPES.find((t) => t.value === type)?.label ?? type;

  if (loading && probes.length === 0) {
    return <OrbitLoader />;
  }

  return (
    <>
      <Header
        title="Probes"
        description="Configure and monitor your probes"
        action={
          <Button onClick={() => { setForm({ site_id: sites[0]?.id ?? 0, probe_type: "http_health", interval_seconds: 300 }); setShowCreate(true); }}>
            <Plus className="h-4 w-4" />
            Add Probe
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
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
        </div>

        {probes.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-7 w-7" />}
            title="No probes configured"
            description="Create your first probe to start monitoring."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                Add Probe
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {probes.map((probe) => (
              <Card key={probe.id} className="overflow-hidden">
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 cursor-pointer hover:bg-black/[0.02] transition-all"
                  onClick={() => toggleExpand(probe.id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{probeTypeLabel(probe.probe_type)}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {siteName(probe.site_id)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Every {probe.interval_seconds}s
                        </span>
                        <Badge variant={probe.is_active ? "success" : "outline"} className="text-[10px]">
                          {probe.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-[52px] sm:pl-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleRun(probe.id); }}
                      disabled={runningProbe === probe.id}
                    >
                      {runningProbe === probe.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      Run
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); handleDelete(probe.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    {expandedProbe === probe.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded results */}
                {expandedProbe === probe.id && (
                  <div className="border-t border-border bg-black/[0.02] p-4 sm:p-5">
                    <h4 className="text-sm font-medium mb-3">Recent Results</h4>
                    {(results[probe.id] ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No results yet. Run the probe to see results.</p>
                    ) : (
                      <div className="space-y-2">
                        {(results[probe.id] ?? []).slice(0, 10).map((result) => (
                          <div
                            key={result.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-black/[0.06] bg-white/[0.02] p-3 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <StatusDot status={result.status} size="sm" pulse={false} />
                              <Badge className={statusBg(result.status)} variant="outline">
                                {result.status}
                              </Badge>
                            </div>
                            <span className="flex-1 truncate text-muted-foreground text-xs sm:text-sm">
                              {result.message}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {result.response_time_ms != null && (
                                <span className="font-mono">
                                  {result.response_time_ms}ms
                                </span>
                              )}
                              <span className="shrink-0">
                                {formatRelative(result.executed_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Probe"
        description="Configure a new monitoring probe."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Site *</label>
            <Select
              value={form.site_id}
              onChange={(e) => setForm({ ...form, site_id: Number(e.target.value) })}
            >
              <option value={0} disabled>Select a site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Probe Type *</label>
            <Select
              value={form.probe_type}
              onChange={(e) => setForm({ ...form, probe_type: e.target.value as ProbeType })}
            >
              {PROBE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Interval (seconds)</label>
            <Input
              type="number"
              min={30}
              value={form.interval_seconds}
              onChange={(e) => setForm({ ...form, interval_seconds: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Probe</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
