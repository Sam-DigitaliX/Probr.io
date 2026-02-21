"use client";

import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-8 py-5 sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
