import { cn } from "@/lib/utils";

const dotColor: Record<string, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
  error: "bg-destructive",
};

const pulseColor: Record<string, string> = {
  ok: "bg-success/40",
  warning: "bg-warning/40",
  critical: "bg-destructive/40",
  error: "bg-destructive/40",
};

interface StatusDotProps {
  status: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ status, size = "md", pulse = true, className }: StatusDotProps) {
  const sizeMap = { sm: "h-2 w-2", md: "h-2.5 w-2.5", lg: "h-3 w-3" };
  const pulseSizeMap = { sm: "h-2 w-2", md: "h-2.5 w-2.5", lg: "h-3 w-3" };

  return (
    <span className={cn("relative inline-flex", className)}>
      {pulse && (status === "critical" || status === "error") && (
        <span
          className={cn(
            "absolute inline-flex rounded-full animate-ping opacity-75",
            pulseSizeMap[size],
            pulseColor[status] ?? "bg-muted-foreground/40"
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          sizeMap[size],
          dotColor[status] ?? "bg-muted-foreground"
        )}
      />
    </span>
  );
}
