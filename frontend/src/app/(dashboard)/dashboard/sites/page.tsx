"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { sites as sitesApi, clients as clientsApi } from "@/lib/api";
import type { Site, SiteCreate, Client } from "@/lib/types";
import { Plus, Globe, Pencil, Trash2, ExternalLink } from "lucide-react";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { formatDate } from "@/lib/utils";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [filterClient, setFilterClient] = useState<number | undefined>();
  const [form, setForm] = useState<SiteCreate>({ client_id: 0, name: "", url: "" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sitesData, clientsData] = await Promise.all([
        sitesApi.list(filterClient),
        clientsApi.list(),
      ]);
      setSites(sitesData);
      setClients(clientsData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterClient]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clientName = (clientId: number) =>
    clients.find((c) => c.id === clientId)?.name ?? `Client #${clientId}`;

  const handleCreate = async () => {
    if (!form.name.trim() || !form.url.trim() || !form.client_id) return;
    try {
      await sitesApi.create(form);
      setShowCreate(false);
      setForm({ client_id: 0, name: "", url: "" });
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleUpdate = async () => {
    if (!editSite || !form.name.trim()) return;
    try {
      await sitesApi.update(editSite.id, { name: form.name, url: form.url });
      setEditSite(null);
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await sitesApi.delete(id);
      fetchData();
    } catch {
      // ignore
    }
  };

  const parseHostname = (url: string) => {
    try { return new URL(url).hostname; } catch { return url; }
  };

  if (loading && sites.length === 0) {
    return <OrbitLoader />;
  }

  return (
    <>
      <Header
        title="Sites"
        description="Manage monitored websites"
        action={
          <Button onClick={() => { setForm({ client_id: clients[0]?.id ?? 0, name: "", url: "" }); setShowCreate(true); }}>
            <Plus className="h-4 w-4 icon-grad" />
            Add Site
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            value={filterClient ?? ""}
            onChange={(e) => setFilterClient(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full sm:w-[220px]"
          >
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        {sites.length === 0 ? (
          <EmptyState
            icon={<Globe className="h-7 w-7 icon-grad" />}
            title="No sites yet"
            description="Add a site to start monitoring its tracking setup."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 icon-grad" />
                Add Site
              </Button>
            }
          />
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="space-y-3 md:hidden">
              {sites.map((site) => (
                <div key={site.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{site.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{clientName(site.client_id)}</p>
                    </div>
                    <Badge variant={site.is_active ? "success" : "outline"} className="shrink-0">
                      {site.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline truncate"
                  >
                    {parseHostname(site.url)}
                    <ExternalLink className="h-3 w-3 shrink-0 icon-grad" />
                  </a>
                  {(site.gtm_ids.length > 0 || site.ga4_ids.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                      {site.gtm_ids.map((id) => (
                        <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>
                      ))}
                      {site.ga4_ids.map((id) => (
                        <Badge key={id} variant="secondary" className="text-[10px] font-mono">{id}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{formatDate(site.created_at)}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditSite(site);
                          setForm({ client_id: site.client_id, name: site.name, url: site.url });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 icon-grad" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(site.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
                      <TableHead>Site</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {clientName(site.client_id)}
                        </TableCell>
                        <TableCell>
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {parseHostname(site.url)}
                            <ExternalLink className="h-3 w-3 icon-grad" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {site.gtm_ids.map((id) => (
                              <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>
                            ))}
                            {site.ga4_ids.map((id) => (
                              <Badge key={id} variant="secondary" className="text-[10px] font-mono">{id}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={site.is_active ? "success" : "outline"}>
                            {site.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(site.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditSite(site);
                                setForm({ client_id: site.client_id, name: site.name, url: site.url });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 icon-grad" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(site.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Site"
        description="Add a new site to monitor."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Client *</label>
            <Select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })}
            >
              <option value={0} disabled>Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Site Name *</label>
            <Input
              placeholder="My Website"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">URL *</label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Site</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editSite}
        onClose={() => setEditSite(null)}
        title="Edit Site"
        description={`Update ${editSite?.name ?? "site"} details.`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Site Name *</label>
            <Input
              placeholder="My Website"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">URL *</label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditSite(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
