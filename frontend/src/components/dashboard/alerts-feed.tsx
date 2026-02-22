"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import type { Alert } from "@/lib/types";

interface AlertsFeedProps {
  alerts: Alert[];
  onResolve?: (id: number) => void;
}

export function AlertsFeed({ alerts, onResolve }: AlertsFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-success mb-2" />
        <p className="text-sm font-medium">All clear</p>
        <p className="text-xs text-muted-foreground">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 5).map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
        >
          <div className="mt-0.5">
            <AlertTriangle
              className={`h-4 w-4 ${
                alert.severity === "critical" ? "text-destructive" : "text-warning"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{alert.title}</p>
              <Badge
                variant={alert.severity === "critical" ? "destructive" : "warning"}
                className="text-[10px] shrink-0"
              >
                {alert.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatRelative(alert.created_at)}
            </p>
          </div>
          {!alert.is_resolved && onResolve && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => onResolve(alert.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
