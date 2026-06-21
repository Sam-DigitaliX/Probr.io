/* ── Enums ──────────────────────────────────────── */
export type ProbeType =
  | "http_health"
  | "sgtm_infra"
  | "gtm_version"
  | "data_volume"
  | "bq_events"
  | "tag_check"
  | "cmp_check"
  | "revenue_triangulation";

export type ProbeStatus = "ok" | "warning" | "critical" | "error";
export type AlertSeverity = "warning" | "critical";

/* ── Models ─────────────────────────────────────── */
export interface Client {
  id: number;
  name: string;
  email: string | null;
  slack_webhook: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: number;
  client_id: number;
  name: string;
  url: string;
  sgtm_url: string | null;
  gtm_ids: string[];
  ga4_ids: string[];
  bigquery_ids: string[];
  cmp_provider: string | null;
  ingest_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProbeConfig {
  id: number;
  site_id: number;
  probe_type: ProbeType;
  config: Record<string, unknown>;
  interval_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProbeResult {
  id: number;
  probe_config_id: number;
  status: ProbeStatus;
  response_time_ms: number | null;
  message: string;
  details: Record<string, unknown> | null;
  executed_at: string;
}

export interface Alert {
  id: number;
  site_id: number;
  probe_config_id: number | null;
  severity: AlertSeverity;
  probe_type: ProbeType;
  title: string;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Dashboard ──────────────────────────────────── */
export interface DashboardSite {
  site_id: number;
  site_name: string;
  site_url: string;
  worst_status: ProbeStatus;
  probes: {
    probe_id: number;
    probe_type: ProbeType;
    is_active: boolean;
    latest_status: ProbeStatus | null;
    latest_message: string | null;
    latest_response_time_ms: number | null;
    latest_executed_at: string | null;
  }[];
  active_alerts: number;
}

export interface DashboardClient {
  client_id: number;
  client_name: string;
  is_active: boolean;
  worst_status: ProbeStatus;
  sites: DashboardSite[];
}

export interface DashboardOverview {
  total_clients: number;
  total_sites: number;
  total_probes: number;
  active_alerts: number;
  clients: DashboardClient[];
}

/* ── Create / Update DTOs ───────────────────────── */
export interface ClientCreate {
  name: string;
  email?: string | null;
  slack_webhook?: string | null;
}

export interface ClientUpdate {
  name?: string;
  email?: string | null;
  slack_webhook?: string | null;
  is_active?: boolean;
}

export interface SiteCreate {
  client_id: number;
  name: string;
  url: string;
  sgtm_url?: string | null;
  gtm_ids?: string[];
  ga4_ids?: string[];
  bigquery_ids?: string[];
  cmp_provider?: string | null;
}

export interface SiteUpdate {
  name?: string;
  url?: string;
  sgtm_url?: string | null;
  gtm_ids?: string[];
  ga4_ids?: string[];
  bigquery_ids?: string[];
  cmp_provider?: string | null;
  is_active?: boolean;
}

export interface ProbeCreate {
  site_id: number;
  probe_type: ProbeType;
  config?: Record<string, unknown>;
  interval_seconds?: number;
}

export interface ProbeUpdate {
  config?: Record<string, unknown>;
  interval_seconds?: number;
  is_active?: boolean;
}

/* ── Monitoring (Probr Listener) ──────────────── */

export interface TagHealthSummary {
  tag_name: string;
  total_executions: number;
  success_count: number;
  failure_count: number;
  success_rate: number;
  avg_execution_time_ms: number;
}

export interface EventVolumeSummary {
  event_name: string;
  total_count: number;
  trend_pct: number | null;
}

export interface UserDataQualitySummary {
  email_rate: number;
  phone_rate: number;
  address_rate: number;
  total_events: number;
}

export interface MonitoringOverview {
  site_id: string;
  site_name: string;
  container_id: string | null;
  period_hours: number;
  total_events: number;
  events: EventVolumeSummary[];
  tags: TagHealthSummary[];
  user_data: UserDataQualitySummary | null;
  last_seen: string | null;
}

export interface MonitoringBatch {
  id: string;
  site_id: string;
  container_id: string;
  window_start: string;
  window_seconds: number;
  total_events: number;
  event_counts: Record<string, number>;
  tag_metrics: Record<string, Record<string, number>>;
  user_data_quality: Record<string, number>;
  ecommerce_quality: Record<string, number>;
  received_at: string;
}
