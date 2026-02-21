import type {
  Client, ClientCreate, ClientUpdate,
  Site, SiteCreate, SiteUpdate,
  ProbeConfig, ProbeCreate, ProbeUpdate,
  ProbeResult, Alert, DashboardOverview,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

/* ── Dashboard ──────────────────────────────────── */
export const dashboard = {
  overview: () => request<DashboardOverview>("/dashboard/overview"),
};

/* ── Clients ────────────────────────────────────── */
export const clients = {
  list: () => request<Client[]>("/clients"),
  get: (id: number) => request<Client>(`/clients/${id}`),
  create: (data: ClientCreate) =>
    request<Client>("/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ClientUpdate) =>
    request<Client>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/clients/${id}`, { method: "DELETE" }),
};

/* ── Sites ──────────────────────────────────────── */
export const sites = {
  list: (clientId?: number) =>
    request<Site[]>(`/sites${clientId ? `?client_id=${clientId}` : ""}`),
  get: (id: number) => request<Site>(`/sites/${id}`),
  create: (data: SiteCreate) =>
    request<Site>("/sites", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: SiteUpdate) =>
    request<Site>(`/sites/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/sites/${id}`, { method: "DELETE" }),
};

/* ── Probes ─────────────────────────────────────── */
export const probes = {
  list: (siteId?: number) =>
    request<ProbeConfig[]>(`/probes${siteId ? `?site_id=${siteId}` : ""}`),
  create: (data: ProbeCreate) =>
    request<ProbeConfig>("/probes", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProbeUpdate) =>
    request<ProbeConfig>(`/probes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/probes/${id}`, { method: "DELETE" }),
  run: (id: number) =>
    request<ProbeResult>(`/probes/${id}/run`, { method: "POST" }),
  results: (id: number) =>
    request<ProbeResult[]>(`/probes/${id}/results`),
};

/* ── Alerts ─────────────────────────────────────── */
export const alerts = {
  list: (siteId?: number) =>
    request<Alert[]>(`/alerts${siteId ? `?site_id=${siteId}` : ""}`),
  resolve: (id: number) =>
    request<Alert>(`/alerts/${id}/resolve`, { method: "PATCH" }),
};
