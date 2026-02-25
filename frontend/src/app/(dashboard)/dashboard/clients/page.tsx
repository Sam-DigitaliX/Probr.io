"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { clients as clientsApi } from "@/lib/api";
import type { Client, ClientCreate } from "@/lib/types";
import { Plus, Users, Pencil, Trash2, Mail, Hash } from "lucide-react";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientCreate>({ name: "", email: "" });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientsApi.list();
      setClients(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await clientsApi.create(form);
      setShowCreate(false);
      setForm({ name: "", email: "" });
      fetchClients();
    } catch {
      // ignore
    }
  };

  const handleUpdate = async () => {
    if (!editClient || !form.name.trim()) return;
    try {
      await clientsApi.update(editClient.id, form);
      setEditClient(null);
      setForm({ name: "", email: "" });
      fetchClients();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await clientsApi.delete(id);
      fetchClients();
    } catch {
      // ignore
    }
  };

  const openEdit = (client: Client) => {
    setEditClient(client);
    setForm({ name: client.name, email: client.email });
  };

  if (loading && clients.length === 0) {
    return <OrbitLoader />;
  }

  return (
    <>
      <Header
        title="Clients"
        description="Manage your monitored clients"
        action={
          <Button onClick={() => { setForm({ name: "", email: "" }); setShowCreate(true); }}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No clients yet"
            description="Add your first client to start monitoring their tracking infrastructure."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            }
          />
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="space-y-3 md:hidden">
              {clients.map((client) => (
                <div key={client.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Hash className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{client.name}</p>
                        {client.email && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            {client.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={client.is_active ? "success" : "outline"} className="shrink-0">
                      {client.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{formatDate(client.created_at)}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(client)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(client.id)}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Hash className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.email ? (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              {client.email}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">&mdash;</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.is_active ? "success" : "outline"}>
                            {client.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(client.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(client)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(client.id)}
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
        title="Add Client"
        description="Add a new client to monitor."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input
              placeholder="Client name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="contact@client.com"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value || null })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Client</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editClient}
        onClose={() => setEditClient(null)}
        title="Edit Client"
        description={`Update ${editClient?.name ?? "client"} details.`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input
              placeholder="Client name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="contact@client.com"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value || null })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditClient(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
