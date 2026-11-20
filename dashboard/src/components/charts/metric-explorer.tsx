import {
  CountryDot,
  EventNote,
  ProvBadge,
  SEVERITY_COLOR,
  StatBox,
} from "@/components/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type TooltipEntry,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  eventsActiveAt,
  eventsFor,
  SHORT_EVENT_LABEL,
  type ShockEvent,
} from "@/data/events";
import type { MetricDef } from "@/data/metrics";
import {
  COUNTRIES,
  DATA,
  FIRST_YEAR,
  populationAt,
  roll3,
  YEARS,
  type Country,
  type Prov,
} from "@/data/series";
import { downloadCsv, downloadSvg } from "@/lib/export";
import { axisValue, fmt1, formatValue, signedPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Download, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";
import { useId, useMemo, useRef, useState, type ReactElement } from "react";
import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

type Mode = "absolute" | "perMillion" | "perCapita" | "index";
type Scale = "linear" | "log";
type Style = "line" | "area";

interface Row {
  year: number;
  italy: number | null;
  finland: number | null;
  italyProv: Prov;
  finlandProv: Prov;
}

const MODE_LABEL: Record<Mode, string> = {
  absolute: "Absolute",
  perMillion: "Per million",
  perCapita: "Per person",
  index: "Index = 100",
};

function transform(
  values: (number | null)[],
  country: Country,
  mode: Mode,
): (number | null)[] {
  if (mode === "absolute") return values;
  if (mode === "index") {
    const base = values.find((v) => v !== null);
    if (base === null || base === undefined || base === 0) return values;
    return values.map((v) => (v === null ? null : (v / base) * 100));
  }
  return values.map((v, i) => {
    if (v === null) return null;
    const pop = populationAt(country, FIRST_YEAR + i);
    return mode === "perMillion" ? (v / pop) * 1e6 : v / pop;
  });
}

function fmtMode(metric: MetricDef, mode: Mode, v: number): string {
  if (mode === "index") return fmt1(v);
  if (mode === "perMillion") return `${fmt1(v)} /M`;
  if (mode === "perCapita") return `$${fmt1(v)}`;
  return formatValue(metric.kind, v);
}

function axisMode(metric: MetricDef, mode: Mode, v: number): string {
  if (mode === "index") return String(Math.round(v));
  if (mode === "perMillion") return fmt1(v);
  if (mode === "perCapita") return `$${Math.round(v)}`;
  return axisValue(metric.kind, v);
}

interface Range {
  s: number;
  e: number;
}

export function MetricExplorer({
  metric,
  focusEvent,
}: {
  metric: MetricDef;
  focusEvent?: ShockEvent;
}) {
  const gid = useId().replace(/:/g, "");
  const chartRef = useRef<HTMLDivElement>(null);
  const last = YEARS.length - 1;

  const initialRange: Range = focusEvent
    ? {
        s: Math.max(0, focusEvent.start - FIRST_YEAR - 1),
        e: Math.min(last, focusEvent.end - FIRST_YEAR + 1),
      }
    : { s: 0, e: last };

  const [visible, setVisible] = useState<Record<Country, boolean>>({
    Italy: true,
    Finland: true,
  });
  const [mode, setMode] = useState<Mode>("absolute");
  const [scale, setScale] = useState<Scale>("linear");
  const [style, setStyle] = useState<Style>("line");
  const [smooth, setSmooth] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [showProv, setShowProv] = useState(true);
  const [dashFI, setDashFI] = useState(false);
  const [range, setRange] = useState<Range>(initialRange);
  const [chartKey, setChartKey] = useState(0);

  const activeCountries = COUNTRIES.filter((c) => visible[c]);

  const rows = useMemo<Row[]>(() => {
    const perCountry = COUNTRIES.map((c) => {
      const raw = DATA[c][metric.id];
      const smoothed = smooth ? roll3(raw) : raw;
      return {
        c,
        values: transform(
          smoothed.map((p) => p.value),
          c,
          mode,
        ),
        provs: raw.map((p) => p.prov),
      };
    });
    return YEARS.map((year, i) => {
      const row: Row = {
        year,
        italy: null,
        finland: null,
        italyProv: "real",
        finlandProv: "real",
      };
      for (const pc of perCountry) {
        if (pc.c === "Italy") {
          row.italy = pc.values[i];
          row.italyProv = pc.provs[i];
        } else {
          row.finland = pc.values[i];
          row.finlandProv = pc.provs[i];
        }
      }
      return row;
    });
  }, [metric.id, smooth, mode]);

  const windowRows = rows.slice(range.s, range.e + 1);
  const events = useMemo(
    () => eventsFor(metric.eventFeatures, activeCountries),
    [metric.eventFeatures, visible],
  );

  const modeOptions: { value: Mode; label: string; title?: string }[] = [
    { value: "absolute", label: MODE_LABEL.absolute },
    ...(metric.perMillion
      ? [{ value: "perMillion" as Mode, label: MODE_LABEL.perMillion }]
      : []),
    ...(metric.perCapita
      ? [{ value: "perCapita" as Mode, label: MODE_LABEL.perCapita }]
      : []),
    {
      value: "index",
      label: MODE_LABEL.index,
      title: "First observed year per country = 100",
    },
  ];

  function toggleCountry(c: Country) {
    setVisible((v) => {
      const next = { ...v, [c]: !v[c] };
      if (!next.Italy && !next.Finland) return v; // keep at least one
      return next;
    });
  }

  function applyRange(s: number, e: number) {
    setRange({ s: Math.max(0, s), e: Math.min(last, e) });
    setChartKey((k) => k + 1);
  }

  function reset() {
    setVisible({ Italy: true, Finland: true });
    setMode("absolute");
    setScale("linear");
    setStyle("line");
    setSmooth(false);
    setShowEvents(true);
    setShowProv(true);
    setDashFI(false);
    applyRange(0, last);
  }

  function exportCsv() {
    const header = ["year"];
    for (const c of activeCountries)
      header.push(`${c}_value`, `${c}_provenance`);
    const body = windowRows.map((r) => {
      const line: (string | number | null)[] = [r.year];
      for (const c of activeCountries) {
        line.push(c === "Italy" ? r.italy : r.finland);
        line.push(c === "Italy" ? r.italyProv : r.finlandProv);
      }
      return line;
    });
    downloadCsv(
      `${metric.slug}-${mode}${smooth ? "-roll3" : ""}.csv`,
      header,
      body,
    );
  }

  function exportSvg() {
    if (chartRef.current) {
      downloadSvg(chartRef.current, `${metric.slug}-${mode}.svg`);
    }
  }

  function statsFor(c: Country) {
    const key = c === "Italy" ? "italy" : "finland";
    const pk = c === "Italy" ? "italyProv" : "finlandProv";
    const pts = windowRows.filter((r) => r[key] !== null);
    if (pts.length === 0) return null;
    const firstPt = pts[0];
    const lastPt = pts[pts.length - 1];
    const fv = firstPt[key] as number;
    const lv = lastPt[key] as number;
    const delta = fv !== 0 ? (lv / fv - 1) * 100 : null;
    let peak = pts[0];
    let trough = pts[0];
    for (const p of pts) {
      if ((p[key] as number) > (peak[key] as number)) peak = p;
      if ((p[key] as number) < (trough[key] as number)) trough = p;
    }
    return { lastPt, lv, delta, peak, trough, lastProv: lastPt[pk] as Prov };
  }

  const winFirst = windowRows[0]?.year ?? FIRST_YEAR;
  const winLast = windowRows[windowRows.length - 1]?.year ?? FIRST_YEAR + last;
  const step = Math.max(1, Math.ceil(windowRows.length / 8));
  const ticks = windowRows.filter((_, i) => i % step === 0).map((r) => r.year);

  function dotFor(c: Country) {
    const pk = c === "Italy" ? "italyProv" : "finlandProv";
    return (props: {
      cx?: number;
      cy?: number;
      index?: number;
      payload?: Row;
    }): ReactElement => {
      const key = `dot-${c}-${props.index ?? 0}`;
      const { cx, cy, payload } = props;
      if (!showProv || cx === undefined || cy === undefined || !payload)
        return <g key={key} />;
      const prov = payload[pk];
      if (prov === "real" || prov === "missing") return <g key={key} />;
      const interpolated = prov === "interpolated";
      return (
        <g key={key}>
          {interpolated ? (
            <circle
              cx={cx}
              cy={cy}
              r={3.5}
              fill="var(--background)"
              stroke="var(--gold)"
              strokeWidth={1.75}
            />
          ) : (
            <path
              d={`M ${cx} ${cy - 4.2} L ${cx + 4.2} ${cy} L ${cx} ${cy + 4.2} L ${cx - 4.2} ${cy} Z`}
              fill="var(--background)"
              stroke="var(--gold)"
              strokeWidth={1.75}
            />
          )}
        </g>
      );
    };
  }

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
    const year = Number(label);
    const idx = year - FIRST_YEAR;
    const row = rows[idx];
    if (!row) return null;
    const prev = idx > 0 ? rows[idx - 1] : null;
    const activeEvents = showEvents ? eventsActiveAt(events, year) : [];
    return (
      <div className="max-w-[300px] rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-xl backdrop-blur">
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-semibold">
          <span className="tabular">{year}</span>
          <span className="font-normal text-muted-foreground">
            {MODE_LABEL[mode]}
            {smooth ? " · 3-yr mean" : ""}
          </span>
        </div>
        <div className="space-y-1.5">
          {activeCountries.map((c) => {
            const key = c === "Italy" ? "italy" : "finland";
            const pk = c === "Italy" ? "italyProv" : "finlandProv";
            const v = row[key];
            const pv = prev ? prev[key] : null;
            const yoy =
              v !== null && pv !== null && pv !== 0 ? (v / pv - 1) * 100 : null;
            return (
              <div key={c} className="flex items-center gap-2 text-xs">
                <CountryDot country={c} />
                <span className="text-muted-foreground">{c}</span>
                <ProvBadge prov={row[pk]} />
                <span className="ml-auto font-semibold tabular">
                  {v === null ? "no data" : fmtMode(metric, mode, v)}
                </span>
                {yoy !== null && (
                  <span
                    className={cn(
                      "tabular",
                      yoy >= 0 ? "text-italy" : "text-rose",
                    )}
                  >
                    {signedPct(yoy)}
                  </span>
                )}
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

  const config = {
    italy: { label: "Italy", color: "var(--italy)" },
    finland: { label: "Finland", color: "var(--finland)" },
  };

  const seriesFor = (c: Country) => {
    const key = c === "Italy" ? "italy" : "finland";
    const common = {
      dataKey: key,
      name: c,
      stroke: `var(--color-${key})`,
      strokeWidth: 2.5,
      strokeDasharray: c === "Finland" && dashFI ? "7 4" : undefined,
      connectNulls: false,
      isAnimationActive: false,
      activeDot: { r: 5, strokeWidth: 2, stroke: "var(--background)" },
    };
    if (style === "area") {
      return (
        <Area
          key={key}
          type="monotone"
          {...common}
          fill={`url(#${gid}-${key})`}
          dot={dotFor(c)}
        />
      );
    }
    return <Line key={key} type="monotone" {...common} dot={dotFor(c)} />;
  };

  return (
    <div className="space-y-4">
      {/* ————— Permanent control region ————— */}
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={visible[c]}
                  onClick={() => toggleCountry(c)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    visible[c]
                      ? "border-border bg-card shadow-sm"
                      : "border-transparent bg-muted/50 text-muted-foreground opacity-60",
                  )}
                >
                  <CountryDot country={c} />
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  <Download className="size-4" aria-hidden /> Export
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Current view</DropdownMenuLabel>
                  <DropdownMenuItem onClick={exportSvg}>
                    Chart as SVG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCsv}>
                    Data as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="size-4" aria-hidden /> Reset
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Normalization
              </div>
              <Segmented
                value={mode}
                onChange={setMode}
                options={modeOptions}
                ariaLabel="Normalization"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Y scale
              </div>
              <Segmented
                value={scale}
                onChange={setScale}
                options={[
                  { value: "linear", label: "Linear" },
                  { value: "log", label: "Log" },
                ]}
                ariaLabel="Y scale"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Style
              </div>
              <Segmented
                value={style}
                onChange={setStyle}
                options={[
                  { value: "line", label: "Line" },
                  { value: "area", label: "Area" },
                ]}
                ariaLabel="Chart style"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-0.5">
              {(
                [
                  ["sm", smooth, setSmooth, "3-yr mean"],
                  ["ev", showEvents, setShowEvents, "Events"],
                  ["pv", showProv, setShowProv, "Estimated pts"],
                  ["df", dashFI, setDashFI, "Dash Finland"],
                ] as const
              ).map(([id, val, set, label]) => (
                <label
                  key={id}
                  htmlFor={`${gid}-${id}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Switch
                    id={`${gid}-${id}`}
                    checked={val}
                    onCheckedChange={(v: boolean) => set(v)}
                    aria-label={label}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Range
            </span>
            {(
              [
                ["All", 0, last],
                ["Crisis 2007–2013", 3, 9],
                ["Recent 2016–2025", 12, last],
              ] as const
            ).map(([label, s, e]) => (
              <Button
                key={label}
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => applyRange(s, e)}
              >
                {label}
              </Button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground tabular">
              {winFirst} – {winLast} · {windowRows.length} pts
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ————— Chart ————— */}
      <Card className="min-w-0">
        <CardContent className="pt-4" ref={chartRef}>
          <ChartContainer config={config} height={360}>
            <ComposedChart
              key={chartKey}
              data={rows}
              margin={{ top: 18, right: 12, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={`${gid}-italy`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--italy)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--italy)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient
                  id={`${gid}-finland`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--finland)"
                    stopOpacity={0.28}
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
                ticks={ticks}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                width={62}
                scale={scale}
                domain={["auto", "auto"]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => axisMode(metric, mode, v)}
              />
              {showEvents &&
                events.map((e) => {
                  if (e.end < winFirst || e.start > winLast) return null;
                  const color = SEVERITY_COLOR[e.severity];
                  if (e.start === e.end) {
                    return (
                      <ReferenceLine
                        key={e.id}
                        x={e.start}
                        stroke={color}
                        strokeDasharray="4 3"
                        strokeOpacity={0.75}
                        ifOverflow="hidden"
                        label={{
                          value: SHORT_EVENT_LABEL[e.id] ?? e.label,
                          position: "insideTopLeft",
                          fill: color,
                          fontSize: 10,
                        }}
                      />
                    );
                  }
                  return (
                    <ReferenceArea
                      key={e.id}
                      x1={Math.max(e.start, winFirst)}
                      x2={Math.min(e.end, winLast)}
                      fill={color}
                      fillOpacity={0.08}
                      stroke={color}
                      strokeOpacity={0.25}
                      strokeDasharray="3 3"
                      ifOverflow="hidden"
                      label={{
                        value: SHORT_EVENT_LABEL[e.id] ?? e.label,
                        position: "insideTopLeft",
                        fill: color,
                        fontSize: 10,
                      }}
                    />
                  );
                })}
              <ChartTooltip
                cursor={{ stroke: "var(--ring)", strokeDasharray: "4 4" }}
                content={<Tip />}
              />
              {activeCountries.map(seriesFor)}
              <Brush
                dataKey="year"
                height={26}
                travellerWidth={8}
                startIndex={range.s}
                endIndex={range.e}
                stroke="var(--ring)"
                fill="var(--muted)"
                tickFormatter={(y: number) => String(y)}
                onChange={(r: { startIndex?: number; endIndex?: number }) =>
                  setRange({ s: r.startIndex ?? 0, e: r.endIndex ?? last })
                }
              />
            </ComposedChart>
          </ChartContainer>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              Unit:{" "}
              {mode === "absolute"
                ? metric.unit
                : mode === "perMillion"
                  ? "per million people"
                  : mode === "perCapita"
                    ? "US$ per person"
                    : "first observed year = 100"}
            </span>
            {showProv && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                  <circle
                    cx="5"
                    cy="5"
                    r="3.5"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                  />
                </svg>
                interpolated
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                  <path
                    d="M5 1 L9 5 L5 9 L1 5 Z"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                  />
                </svg>
                extrapolated
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ————— Live window stats ————— */}
      <div className="grid gap-3 sm:grid-cols-2">
        {activeCountries.map((c) => {
          const s = statsFor(c);
          if (!s) return null;
          const key = c === "Italy" ? "italy" : "finland";
          return (
            <Card key={c}>
              <CardContent className="py-3.5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <CountryDot country={c} /> {c}
                  <span className="text-xs font-normal text-muted-foreground tabular">
                    in view {winFirst}–{winLast}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox
                    label={`Latest (${s.lastPt.year})`}
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        {fmtMode(metric, mode, s.lv)}
                        <ProvBadge prov={s.lastProv} />
                      </span>
                    }
                  />
                  <StatBox
                    label="Δ in view"
                    value={
                      s.delta === null ? (
                        "—"
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            s.delta >= 0 ? "text-italy" : "text-rose",
                          )}
                        >
                          {s.delta >= 0 ? (
                            <TrendingUp className="size-3.5" aria-hidden />
                          ) : (
                            <TrendingDown className="size-3.5" aria-hidden />
                          )}
                          {signedPct(s.delta)}
                        </span>
                      )
                    }
                  />
                  <StatBox
                    label="Peak"
                    value={fmtMode(metric, mode, s.peak[key] as number)}
                    sub={s.peak.year}
                  />
                  <StatBox
                    label="Trough"
                    value={fmtMode(metric, mode, s.trough[key] as number)}
                    sub={s.trough.year}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ————— Event chips ————— */}
      {showEvents && (
        <div className="flex flex-wrap items-center gap-2">
          {events.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              No annotated shock events for this indicator.
            </span>
          ) : (
            events.map((e) => (
              <Tooltip key={e.id}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() =>
                        applyRange(
                          e.start - FIRST_YEAR - 1,
                          e.end - FIRST_YEAR + 1,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-ring"
                    />
                  }
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: SEVERITY_COLOR[e.severity] }}
                    aria-hidden
                  />
                  {e.label}
                  <span className="text-muted-foreground tabular">
                    {e.start === e.end ? e.start : `${e.start}–${e.end}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <EventNote event={e} />
                  <div className="mt-1.5 text-[10px] text-muted-foreground">
                    Click to zoom the chart to this event.
                  </div>
                </TooltipContent>
              </Tooltip>
            ))
          )}
        </div>
      )}
    </div>
  );
}
