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
import { Plus, Globe, Pencil, Trash2, RefreshCw, ExternalLink } from "lucide-react";
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
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header
        title="Sites"
        description="Manage monitored websites"
        action={
          <Button onClick={() => { setForm({ client_id: clients[0]?.id ?? 0, name: "", url: "" }); setShowCreate(true); }}>
            <Plus className="h-4 w-4" />
            Add Site
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            value={filterClient ?? ""}
            onChange={(e) => setFilterClient(e.target.value ? Number(e.target.value) : undefined)}
            className="w-[220px]"
          >
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        {sites.length === 0 ? (
          <EmptyState
            icon={<Globe className="h-7 w-7" />}
            title="No sites yet"
            description="Add a site to start monitoring its tracking setup."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                Add Site
              </Button>
            }
          />
        ) : (
          <Card>
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
                          <ExternalLink className="h-3 w-3" />
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
                            <Pencil className="h-3.5 w-3.5" />
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
