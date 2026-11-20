import { useChatDock } from "@/chat/use-chat-dock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CoefRow, FitStats, RemovalStep, VifEntry } from "@/data/results";
import { pVal, sci } from "@/lib/format";
import { effectLabel, prettyFeature, type EffectTarget } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Sigma,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

export function AnalysisHero({
  index,
  title,
  lede,
  chips,
  ask,
}: {
  index: string;
  title: string;
  lede: string;
  chips: { label: string; value: string }[];
  ask: string;
}) {
  const { openChat } = useChatDock();
  return (
    <header className="rise space-y-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Sigma className="size-3.5 text-violet" aria-hidden />
        Analysis {index}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <Button variant="outline" size="sm" onClick={() => openChat(ask)}>
          <Sparkles className="size-4 text-gold" aria-hidden />
          Ask about this model
        </Button>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {lede}
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-xs"
          >
            <span className="text-muted-foreground">{c.label}</span>
            <span className="font-semibold tabular">{c.value}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

function fitTone(key: string, value: number): "ok" | "warn" | "bad" {
  if (key === "adj_r_squared")
    return value < 0 ? "bad" : value < 0.3 ? "warn" : "ok";
  if (key === "dw") return value < 1.5 ? "warn" : "ok";
  if (key === "f_pvalue") return value > 0.05 ? "bad" : "ok";
  if (key === "omnibus_p") return value < 0.05 ? "warn" : "ok";
  return "ok";
}

export function FitChips({ fit, n }: { fit: FitStats; n: number }) {
  const items: {
    key: string;
    label: string;
    value: string;
    raw: number;
    hint: string;
  }[] = [
    {
      key: "n",
      label: "N",
      value: String(n),
      raw: n,
      hint: "Annual observations in the fit.",
    },
    {
      key: "r_squared",
      label: "R²",
      value: fit.r_squared.toFixed(3),
      raw: fit.r_squared,
      hint: "Share of variance explained — trending levels inflate this.",
    },
    {
      key: "adj_r_squared",
      label: "Adj. R²",
      value: fit.adj_r_squared.toFixed(3),
      raw: fit.adj_r_squared,
      hint: "Degrees-of-freedom-adjusted fit. Negative means worse than a mean-only model after the penalty.",
    },
    {
      key: "dw",
      label: "Durbin–Watson",
      value: fit.dw.toFixed(2),
      raw: fit.dw,
      hint: "≈2 is clean; <1.5 suggests positive residual autocorrelation (p-values optimistic).",
    },
    {
      key: "aic",
      label: "AIC",
      value: fit.aic.toFixed(1),
      raw: fit.aic,
      hint: "Comparable only between models on the same target series.",
    },
    {
      key: "omnibus_p",
      label: "Omnibus p",
      value: pVal(fit.omnibus_p),
      raw: fit.omnibus_p,
      hint: "Residual normality check; <0.05 flags non-normal residuals.",
    },
  ];
  if (fit.f_pvalue !== undefined) {
    items.splice(3, 0, {
      key: "f_pvalue",
      label: "F-test p",
      value: pVal(fit.f_pvalue),
      raw: fit.f_pvalue,
      hint: "Joint significance of all predictors. >0.05: the model as a whole is not significant.",
    });
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {items.map((it) => {
        const tone =
          it.key === "n" || it.key === "aic" ? "ok" : fitTone(it.key, it.raw);
        return (
          <Tooltip key={it.key}>
            <TooltipTrigger
              nativeButton={false}
              render={
                <div
                  className={cn(
                    "rounded-lg border bg-card/70 px-2.5 py-2",
                    tone === "ok" && "border-border",
                    tone === "warn" && "border-gold/50",
                    tone === "bad" && "border-rose/50",
                  )}
                />
              }
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {it.label}
              </div>
              <div
                className={cn(
                  "text-sm font-semibold tabular",
                  tone === "warn" && "text-gold",
                  tone === "bad" && "text-rose",
                )}
              >
                {it.value}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-60 text-xs">
              {it.hint}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function SigBadge({ row }: { row: CoefRow }) {
  if (row.sig5_hc3)
    return (
      <Badge className="bg-italy/15 text-italy hover:bg-italy/15">
        sig. 5%
      </Badge>
    );
  if (row.p_hc3 < 0.1)
    return (
      <Badge className="bg-gold/15 text-gold hover:bg-gold/15">10% only</Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      n.s.
    </Badge>
  );
}

export function CoefTable({
  rows,
  target,
  caption,
}: {
  rows: CoefRow[];
  target: EffectTarget;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        {caption && (
          <caption className="border-b border-border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground">
            {caption}
          </caption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Predictor</TableHead>
            <TableHead className="text-right">β</TableHead>
            <TableHead className="text-right">HC3 SE</TableHead>
            <TableHead className="text-right">p (HC3)</TableHead>
            <TableHead>Significance</TableHead>
            <TableHead>Conditional association</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const effect = effectLabel(r.feature, r.coef, target);
            const isConst = r.feature === "const";
            return (
              <TableRow
                key={r.feature}
                className={cn(isConst && "text-muted-foreground")}
              >
                <TableCell className="font-medium">
                  {prettyFeature(r.feature)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular">
                  {sci(r.coef)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular">
                  {sci(r.se_hc3)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular">
                  {pVal(r.p_hc3)}
                </TableCell>
                <TableCell>
                  {isConst ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <SigBadge row={r} />
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {effect ?? "—"}
                  {r.feature === "gini_index" && target !== "gii" && (
                    <span className="ml-1 text-gold">
                      (fragile: ±1.5-pt range)
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function VifBars({
  entries,
  dropped,
  accent,
  threshold = 5,
}: {
  entries: VifEntry[];
  dropped: Set<string>;
  accent: string;
  threshold?: number;
}) {
  const data = entries.map((e) => ({
    name: prettyFeature(e.feature),
    vif: e.VIF,
    dropped: dropped.has(e.feature),
  }));
  const max = Math.max(...entries.map((e) => e.VIF), threshold);
  return (
    <ChartContainer
      config={{ vif: { label: "VIF", color: accent } }}
      height={data.length * 32 + 42}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 14, right: 44, bottom: 0, left: 8 }}
      >
        <XAxis
          type="number"
          domain={[0, Math.ceil(max * 1.12)]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={168}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10.5 }}
          tickLine={false}
          axisLine={false}
        />
        <ReferenceLine
          x={threshold}
          stroke="var(--gold)"
          strokeDasharray="4 3"
          label={{
            value: `VIF ${threshold}`,
            position: "top",
            fill: "var(--gold)",
            fontSize: 10,
          }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
          content={<ChartTooltipContent formatter={(v) => v.toFixed(2)} />}
        />
        <Bar
          dataKey="vif"
          name="VIF"
          radius={[0, 5, 5, 0]}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell
              key={d.name}
              fill={
                d.dropped
                  ? "var(--rose)"
                  : d.vif > threshold
                    ? "var(--gold)"
                    : accent
              }
              fillOpacity={d.dropped ? 0.85 : 0.9}
            />
          ))}
          <LabelList
            dataKey="vif"
            position="right"
            formatter={(v: number) => v.toFixed(1)}
            style={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function RemovalTrail({ steps }: { steps: RemovalStep[] }) {
  if (steps.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No eliminations needed.</p>
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.iteration} className="flex items-center gap-2">
          {i > 0 && (
            <ArrowRight
              className="size-3.5 text-muted-foreground"
              aria-hidden
            />
          )}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose/40 bg-rose/10 px-2.5 py-1 text-xs">
            <span className="font-medium text-rose">
              {prettyFeature(s.dropped)}
            </span>
            <span className="text-muted-foreground tabular">
              VIF {s.vif.toFixed(1)}
            </span>
          </span>
        </div>
      ))}
      <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
      <span className="rounded-lg border border-italy/40 bg-italy/10 px-2.5 py-1 text-xs font-medium text-italy">
        all remaining ≤ 5
      </span>
    </div>
  );
}

export function CaveatCard({
  title = "Read with care",
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <Card className="border-gold/40 bg-gold/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-gold">
          <AlertTriangle className="size-4" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-gold"
                aria-hidden
              />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ReadingCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="prose-take text-sm leading-relaxed text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card/70">
      {items.map((it) => (
        <details key={it.q} className="group px-4 py-3">
          <summary className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
            {it.q}
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {it.a}
          </p>
        </details>
      ))}
    </div>
  );
}
