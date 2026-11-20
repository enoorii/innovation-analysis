import { CountryDot, EventNote, SEVERITY_COLOR } from "@/components/atoms";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    type TooltipEntry,
} from "@/components/ui/chart";
import { Segmented } from "@/components/ui/segmented";
import { eventsActiveAt, eventsFor, SHORT_EVENT_LABEL } from "@/data/events";
import { METRIC_BY_ID } from "@/data/metrics";
import { DATA, YEARS, type Country } from "@/data/series";
import { axisValue, formatValue } from "@/lib/format";
import { useId, useMemo, useState } from "react";
import {
    Area,
    CartesianGrid,
    ComposedChart,
    ReferenceArea,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";

type FlagKey = "hitech_exports_usd" | "gii_score" | "rd_pct_gdp";

const OPTIONS: { value: FlagKey; label: string }[] = [
  { value: "hitech_exports_usd", label: "Hi-tech exports" },
  { value: "gii_score", label: "GII" },
  { value: "rd_pct_gdp", label: "R&D %" },
];

interface Row {
  year: number;
  italy: number | null;
  finland: number | null;
}

export function FlagshipChart() {
  const [key, setKey] = useState<FlagKey>("hitech_exports_usd");
  const gid = useId().replace(/:/g, "");
  const metric = METRIC_BY_ID[key];

  const rows = useMemo<Row[]>(
    () =>
      YEARS.map((year, i) => ({
        year,
        italy: DATA.Italy[key][i].value,
        finland: DATA.Finland[key][i].value,
      })),
    [key],
  );

  const events = useMemo(
    () => eventsFor(metric.eventFeatures, ["Italy", "Finland"]),
    [metric.eventFeatures],
  );

  const config = {
    italy: { label: "Italy", color: "var(--italy)" },
    finland: { label: "Finland", color: "var(--finland)" },
  };

  function Tip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: number;
  }) {
    if (!active || !payload?.length || label === undefined) return null;
    const yr = Number(label);
    const activeEvents = eventsActiveAt(events, yr);
    return (
      <div className="max-w-[280px] rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-xl backdrop-blur">
        <div className="mb-1.5 text-xs font-semibold tabular">{yr}</div>
        <div className="space-y-1">
          {(["Italy", "Finland"] as Country[]).map((c) => {
            const v = rows[yr - 2004]?.[c === "Italy" ? "italy" : "finland"];
            if (v === null || v === undefined) return null;
            return (
              <div key={c} className="flex items-center gap-2 text-xs">
                <CountryDot country={c} />
                <span className="text-muted-foreground">{c}</span>
                <span className="ml-auto font-semibold tabular">
                  {formatValue(metric.kind, v)}
                </span>
              </div>
            );
          })}
        </div>
        {activeEvents.length > 0 && (
          <div className="mt-2 space-y-1.5 border-t border-border pt-2">
            {activeEvents.map((e) => (
              <EventNote key={e.id} event={e} compact />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="glow-finland overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-2">
        <div>
          <div className="text-sm font-semibold">The great divergence</div>
          <div className="text-xs text-muted-foreground">
            Italy × Finland · hover the shaded shocks
          </div>
        </div>
        <Segmented
          value={key}
          onChange={setKey}
          options={OPTIONS}
          size="xs"
          ariaLabel="Flagship metric"
        />
      </CardHeader>
      <CardContent className="pb-3">
        <ChartContainer config={config} height={280}>
          <ComposedChart
            data={rows}
            margin={{ top: 18, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={`${gid}-it`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--italy)" stopOpacity={0.3} />
                <stop
                  offset="100%"
                  stopColor="var(--italy)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id={`${gid}-fi`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--finland)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--finland)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.55}
              vertical={false}
            />
            <XAxis
              dataKey="year"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickCount={8}
            />
            <YAxis
              width={52}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => axisValue(metric.kind, v)}
              domain={["auto", "auto"]}
            />
            {events.map((e) =>
              e.start === e.end ? (
                <ReferenceLine
                  key={e.id}
                  x={e.start}
                  stroke={SEVERITY_COLOR[e.severity]}
                  strokeDasharray="4 3"
                  strokeOpacity={0.7}
                  ifOverflow="hidden"
                />
              ) : (
                <ReferenceArea
                  key={e.id}
                  x1={e.start}
                  x2={e.end}
                  fill={SEVERITY_COLOR[e.severity]}
                  fillOpacity={0.08}
                  stroke={SEVERITY_COLOR[e.severity]}
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                  ifOverflow="hidden"
                  label={{
                    value: SHORT_EVENT_LABEL[e.id] ?? e.label,
                    position: "insideTopLeft",
                    fill: SEVERITY_COLOR[e.severity],
                    fontSize: 10,
                  }}
                />
              ),
            )}
            <ChartTooltip
              cursor={{ stroke: "var(--ring)", strokeDasharray: "4 4" }}
              content={<Tip />}
            />
            <Area
              type="monotone"
              dataKey="italy"
              name="Italy"
              stroke="var(--italy)"
              strokeWidth={2.5}
              fill={`url(#${gid}-it)`}
              dot={false}
              activeDot={{ r: 4.5 }}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="finland"
              name="Finland"
              stroke="var(--finland)"
              strokeWidth={2.5}
              fill={`url(#${gid}-fi)`}
              dot={false}
              activeDot={{ r: 4.5 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ChartContainer>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CountryDot country="Italy" /> Italy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CountryDot country="Finland" /> Finland
          </span>
          <span className="ml-auto hidden sm:inline">
            bands = annotated shock events
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
