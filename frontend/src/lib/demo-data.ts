import type {
  DashboardOverview,
  DashboardClient,
  Alert,
  TagHealthSummary,
  EventVolumeSummary,
  UserDataQualitySummary,
  MonitoringBatch,
} from "./types";

/* ── Helpers ──────────────────────────────────────── */
const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/* ── Dashboard overview ───────────────────────────── */
export const demoClients: DashboardClient[] = [
  {
    client_id: 1,
    client_name: "FashionRetail.fr",
    is_active: true,
    worst_status: "ok",
    sites: [
      {
        site_id: 1,
        site_name: "fashionretail.fr",
        site_url: "https://fashionretail.fr",
        worst_status: "ok",
        active_alerts: 0,
        probes: [
          { probe_id: 1, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 42ms", latest_response_time_ms: 42, latest_executed_at: ago(2) },
          { probe_id: 2, probe_type: "gtm_version", is_active: true, latest_status: "ok", latest_message: "Container v87 live", latest_response_time_ms: null, latest_executed_at: ago(5) },
          { probe_id: 3, probe_type: "data_volume", is_active: true, latest_status: "ok", latest_message: "12 847 events/h — within range", latest_response_time_ms: null, latest_executed_at: ago(3) },
          { probe_id: 4, probe_type: "cmp_check", is_active: true, latest_status: "ok", latest_message: "Axeptio CMP loading correctly", latest_response_time_ms: 310, latest_executed_at: ago(8) },
        ],
      },
      {
        site_id: 2,
        site_name: "fashionretail.com",
        site_url: "https://fashionretail.com",
        worst_status: "ok",
        active_alerts: 0,
        probes: [
          { probe_id: 5, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 38ms", latest_response_time_ms: 38, latest_executed_at: ago(2) },
          { probe_id: 6, probe_type: "bq_events", is_active: true, latest_status: "ok", latest_message: "BQ events matching — 99.8% accuracy", latest_response_time_ms: null, latest_executed_at: ago(10) },
        ],
      },
    ],
  },
  {
    client_id: 2,
    client_name: "GourmetBio.com",
    is_active: true,
    worst_status: "warning",
    sites: [
      {
        site_id: 3,
        site_name: "gourmetbio.com",
        site_url: "https://gourmetbio.com",
        worst_status: "warning",
        active_alerts: 1,
        probes: [
          { probe_id: 7, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 55ms", latest_response_time_ms: 55, latest_executed_at: ago(1) },
          { probe_id: 8, probe_type: "data_volume", is_active: true, latest_status: "warning", latest_message: "Event volume down 32% vs previous week", latest_response_time_ms: null, latest_executed_at: ago(4) },
          { probe_id: 9, probe_type: "tag_check", is_active: true, latest_status: "ok", latest_message: "All 6 tags firing correctly", latest_response_time_ms: 1840, latest_executed_at: ago(12) },
        ],
      },
    ],
  },
  {
    client_id: 3,
    client_name: "TechStore Pro",
    is_active: true,
    worst_status: "critical",
    sites: [
      {
        site_id: 4,
        site_name: "techstorepro.fr",
        site_url: "https://techstorepro.fr",
        worst_status: "critical",
        active_alerts: 2,
        probes: [
          { probe_id: 10, probe_type: "http_health", is_active: true, latest_status: "critical", latest_message: "sGTM endpoint unreachable — timeout after 10s", latest_response_time_ms: 10000, latest_executed_at: ago(1) },
          { probe_id: 11, probe_type: "sgtm_infra", is_active: true, latest_status: "critical", latest_message: "Stape container CPU 98% — scaling issue", latest_response_time_ms: null, latest_executed_at: ago(2) },
          { probe_id: 12, probe_type: "gtm_version", is_active: true, latest_status: "ok", latest_message: "Container v42 live", latest_response_time_ms: null, latest_executed_at: ago(5) },
          { probe_id: 13, probe_type: "data_volume", is_active: true, latest_status: "ok", latest_message: "24 391 events/h — within range", latest_response_time_ms: null, latest_executed_at: ago(3) },
        ],
      },
      {
        site_id: 5,
        site_name: "techstorepro.be",
        site_url: "https://techstorepro.be",
        worst_status: "ok",
        active_alerts: 0,
        probes: [
          { probe_id: 14, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 61ms", latest_response_time_ms: 61, latest_executed_at: ago(2) },
        ],
      },
    ],
  },
  {
    client_id: 4,
    client_name: "MaisonDeco.fr",
    is_active: true,
    worst_status: "ok",
    sites: [
      {
        site_id: 6,
        site_name: "maisondeco.fr",
        site_url: "https://maisondeco.fr",
        worst_status: "ok",
        active_alerts: 0,
        probes: [
          { probe_id: 15, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 29ms", latest_response_time_ms: 29, latest_executed_at: ago(1) },
          { probe_id: 16, probe_type: "cmp_check", is_active: true, latest_status: "ok", latest_message: "Didomi CMP operational", latest_response_time_ms: 280, latest_executed_at: ago(9) },
          { probe_id: 17, probe_type: "bq_events", is_active: true, latest_status: "ok", latest_message: "BQ events matching — 100% accuracy", latest_response_time_ms: null, latest_executed_at: ago(6) },
        ],
      },
    ],
  },
  {
    client_id: 5,
    client_name: "SportMax Europe",
    is_active: true,
    worst_status: "ok",
    sites: [
      {
        site_id: 7,
        site_name: "sportmax.eu",
        site_url: "https://sportmax.eu",
        worst_status: "ok",
        active_alerts: 0,
        probes: [
          { probe_id: 18, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 35ms", latest_response_time_ms: 35, latest_executed_at: ago(2) },
          { probe_id: 19, probe_type: "tag_check", is_active: true, latest_status: "ok", latest_message: "All 8 tags firing correctly", latest_response_time_ms: 2100, latest_executed_at: ago(15) },
        ],
      },
      {
        site_id: 8,
        site_name: "sportmax.de",
        site_url: "https://sportmax.de",
        worst_status: "ok",
        active_alerts: 0,
        probes: [
          { probe_id: 20, probe_type: "http_health", is_active: true, latest_status: "ok", latest_message: "sGTM endpoint healthy — 44ms", latest_response_time_ms: 44, latest_executed_at: ago(3) },
        ],
      },
    ],
  },
];

export const demoOverview: DashboardOverview = {
  total_clients: 5,
  total_sites: 8,
  total_probes: 20,
  active_alerts: 3,
  clients: demoClients,
};

/* ── Alerts ───────────────────────────────────────── */
export const demoAlerts: Alert[] = [
  {
    id: 1,
    site_id: 4,
    probe_config_id: 10,
    severity: "critical",
    probe_type: "http_health",
    title: "sGTM Endpoint Down",
    message: "techstorepro.fr — sGTM endpoint unreachable for 8 minutes. Data collection is impacted.",
    is_resolved: false,
    resolved_at: null,
    notified_at: ago(7),
    created_at: ago(8),
    updated_at: ago(8),
  },
  {
    id: 2,
    site_id: 4,
    probe_config_id: 11,
    severity: "critical",
    probe_type: "sgtm_infra",
    title: "Stape Container Overloaded",
    message: "techstorepro.fr — Container CPU at 98%. Auto-scaling may be disabled. Check Stape dashboard.",
    is_resolved: false,
    resolved_at: null,
    notified_at: ago(6),
    created_at: ago(7),
    updated_at: ago(7),
  },
  {
    id: 3,
    site_id: 3,
    probe_config_id: 8,
    severity: "warning",
    probe_type: "data_volume",
    title: "Event Volume Drop",
    message: "gourmetbio.com — Event volume down 32% compared to same day last week. Possible tracking issue.",
    is_resolved: false,
    resolved_at: null,
    notified_at: ago(15),
    created_at: ago(18),
    updated_at: ago(18),
  },
];

/* ── Monitoring — Tag Health ──────────────────────── */
export const demoTagHealth: TagHealthSummary[] = [
  { tag_name: "GA4", total_executions: 48_921, success_count: 48_893, failure_count: 28, success_rate: 99.94, avg_execution_time_ms: 45 },
  { tag_name: "Google Ads", total_executions: 12_340, success_count: 12_318, failure_count: 22, success_rate: 99.82, avg_execution_time_ms: 62 },
  { tag_name: "Meta CAPI", total_executions: 11_890, success_count: 11_854, failure_count: 36, success_rate: 99.70, avg_execution_time_ms: 120 },
  { tag_name: "TikTok Events API", total_executions: 8_450, success_count: 8_391, failure_count: 59, success_rate: 99.30, avg_execution_time_ms: 185 },
  { tag_name: "Pinterest CAPI", total_executions: 4_210, success_count: 4_197, failure_count: 13, success_rate: 99.69, avg_execution_time_ms: 98 },
  { tag_name: "Snapchat CAPI", total_executions: 3_100, success_count: 3_074, failure_count: 26, success_rate: 99.16, avg_execution_time_ms: 142 },
];

/* ── Monitoring — Event Volumes ───────────────────── */
export const demoEventVolumes: EventVolumeSummary[] = [
  { event_name: "page_view", total_count: 34_280, trend_pct: 5.2 },
  { event_name: "view_item", total_count: 12_940, trend_pct: 3.8 },
  { event_name: "add_to_cart", total_count: 4_870, trend_pct: -1.2 },
  { event_name: "begin_checkout", total_count: 2_310, trend_pct: 7.1 },
  { event_name: "purchase", total_count: 1_247, trend_pct: 12.3 },
  { event_name: "login", total_count: 3_420, trend_pct: 0.5 },
  { event_name: "sign_up", total_count: 890, trend_pct: 18.6 },
  { event_name: "view_item_list", total_count: 8_640, trend_pct: -4.1 },
];

/* ── Monitoring — User Data Quality ───────────────── */
export const demoUserDataQuality: UserDataQualitySummary = {
  email_rate: 34.2,
  phone_rate: 12.8,
  address_rate: 8.4,
  total_events: 48_921,
};

/* ── Monitoring — Time series batches (last 24h, hourly) ── */
function generateHourlyBatches(): { hour: string; events: number }[] {
  const data: { hour: string; events: number }[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i, 0, 0, 0);
    // Simulate realistic daily pattern (low at night, peak midday)
    const hour = d.getHours();
    const baseMultiplier =
      hour >= 0 && hour < 6
        ? 0.15 + Math.random() * 0.1
        : hour >= 6 && hour < 9
          ? 0.4 + Math.random() * 0.15
          : hour >= 9 && hour < 12
            ? 0.8 + Math.random() * 0.15
            : hour >= 12 && hour < 14
              ? 1.0
              : hour >= 14 && hour < 18
                ? 0.85 + Math.random() * 0.1
                : hour >= 18 && hour < 21
                  ? 0.7 + Math.random() * 0.15
                  : 0.35 + Math.random() * 0.1;

    const events = Math.round(2800 * baseMultiplier + Math.random() * 400);
    data.push({
      hour: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      events,
    });
  }
  return data;
}

export const demoHourlyEvents = generateHourlyBatches();

/* ── Probe timeline (last results for overview) ───── */
export interface ProbeTimelineEntry {
  time: string;
  probeType: string;
  site: string;
  status: "ok" | "warning" | "critical";
  message: string;
  responseMs: number | null;
}

export const demoProbeTimeline: ProbeTimelineEntry[] = [
  { time: ago(1), probeType: "http_health", site: "techstorepro.fr", status: "critical", message: "sGTM endpoint unreachable — timeout after 10s", responseMs: 10000 },
  { time: ago(1), probeType: "http_health", site: "gourmetbio.com", status: "ok", message: "sGTM endpoint healthy — 55ms", responseMs: 55 },
  { time: ago(2), probeType: "sgtm_infra", site: "techstorepro.fr", status: "critical", message: "Stape container CPU 98%", responseMs: null },
  { time: ago(2), probeType: "http_health", site: "fashionretail.fr", status: "ok", message: "sGTM endpoint healthy — 42ms", responseMs: 42 },
  { time: ago(2), probeType: "http_health", site: "sportmax.eu", status: "ok", message: "sGTM endpoint healthy — 35ms", responseMs: 35 },
  { time: ago(3), probeType: "data_volume", site: "fashionretail.fr", status: "ok", message: "12 847 events/h — within range", responseMs: null },
  { time: ago(3), probeType: "http_health", site: "sportmax.de", status: "ok", message: "sGTM endpoint healthy — 44ms", responseMs: 44 },
  { time: ago(4), probeType: "data_volume", site: "gourmetbio.com", status: "warning", message: "Event volume down 32% vs previous week", responseMs: null },
  { time: ago(5), probeType: "gtm_version", site: "fashionretail.fr", status: "ok", message: "Container v87 live", responseMs: null },
  { time: ago(5), probeType: "gtm_version", site: "techstorepro.fr", status: "ok", message: "Container v42 live", responseMs: null },
  { time: ago(6), probeType: "bq_events", site: "maisondeco.fr", status: "ok", message: "BQ events matching — 100% accuracy", responseMs: null },
  { time: ago(8), probeType: "cmp_check", site: "fashionretail.fr", status: "ok", message: "Axeptio CMP loading correctly", responseMs: 310 },
];
