"use client";

import Link from "next/link";
import { ExternalLink, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import type { DashboardClient } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  ok: "Healthy",
  warning: "Warning",
  critical: "Critical",
  error: "Error",
};

const badgeVariant = (status: string) => {
  switch (status) {
    case "ok": return "success" as const;
    case "warning": return "warning" as const;
    case "critical":
    case "error": return "destructive" as const;
    default: return "outline" as const;
  }
};

interface ClientStatusGridProps {
  clients: DashboardClient[];
}

export function ClientStatusGrid({ clients }: ClientStatusGridProps) {
  if (clients.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No clients yet. Add your first client to start monitoring.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {clients.map((client, i) => (
        <div
          key={client.client_id}
          className={cn(
            "glass-card-interactive p-5 animate-fade-in-up",
            `animate-delay-${((i % 6) + 1) * 100}`
          )}
        >
          {/* Client Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusDot status={client.worst_status} size="lg" />
              <div>
                <h3 className="font-semibold text-sm">{client.client_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {client.sites.length} site{client.sites.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Badge variant={badgeVariant(client.worst_status)}>
              {statusLabel[client.worst_status] ?? client.worst_status}
            </Badge>
          </div>

          {/* Sites */}
          <div className="space-y-2">
            {client.sites.slice(0, 3).map((site) => (
              <div
                key={site.site_id}
                className="flex items-center justify-between rounded-lg bg-black/[0.02] border border-black/[0.04] px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={site.worst_status} size="sm" pulse={false} />
                  <span className="font-medium truncate">{site.site_name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {site.active_alerts > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {site.active_alerts}
                    </Badge>
                  )}
                  <a
                    href={site.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 icon-grad" />
                  </a>
                </div>
              </div>
            ))}
            {client.sites.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{client.sites.length - 3} more sites
              </p>
            )}
          </div>

          {/* Footer */}
          <Link
            href="/dashboard/clients"
            className="flex items-center justify-center gap-1 mt-4 pt-3 border-t border-border text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View details
            <ChevronRight className="h-3 w-3 icon-grad" />
          </Link>
        </div>
      ))}
    </div>
  );
}
