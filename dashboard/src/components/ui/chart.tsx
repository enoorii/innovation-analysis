import { cn } from "@/lib/utils";
import {
    useMemo,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from "react";
import { ResponsiveContainer, Tooltip } from "recharts";

export type ChartConfig = Record<string, { label: string; color: string }>;

/**
 * Lean shadcn-style chart container: exposes each config color as
 * `--color-{key}` so series can reference `var(--color-italy)` etc.,
 * keeping charts tied to the theme.
 */
export function ChartContainer({
  config,
  height = 320,
  className,
  children,
}: {
  config: ChartConfig;
  height?: number;
  className?: string;
  children: ReactElement;
}) {
  const style = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(config).map(([k, v]) => [`--color-${k}`, v.color]),
      ) as CSSProperties,
    [config],
  );
  return (
    <div data-chart style={style} className={cn("w-full min-w-0", className)}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const ChartTooltip = Tooltip;

export interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter?: (value: number, key: string) => string;
  labelFormatter?: (label: string | number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="min-w-40 rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label !== undefined && (
        <div className="mb-1.5 font-semibold text-foreground tabular">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const key = String(entry.dataKey ?? entry.name ?? i);
          const v = typeof entry.value === "number" ? entry.value : null;
          return (
            <div key={`${key}-${i}`} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: entry.color ?? "var(--muted-foreground)" }}
              />
              <span className="text-muted-foreground">{entry.name ?? key}</span>
              <span className="ml-auto font-medium text-foreground tabular">
                {v !== null && formatter
                  ? formatter(v, key)
                  : String(entry.value ?? "—")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {children}
    </div>
  );
}
