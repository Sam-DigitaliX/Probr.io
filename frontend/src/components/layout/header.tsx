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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-glass-border bg-glass backdrop-blur-xl px-4 py-4 sm:px-8 sm:py-5 sticky top-0 z-20">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {action}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4 icon-grad" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 icon-grad" />
        </Button>
      </div>
    </div>
  );
}
