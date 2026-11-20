import { useChatDock } from "@/chat/use-chat-dock";
import { CountryDot, SectionTitle, SeverityDot } from "@/components/atoms";
import { FlagshipChart } from "@/components/charts/flagship";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EVENTS, EVENT_TARGET_METRIC } from "@/data/events";
import { METRIC_BY_ID } from "@/data/metrics";
import { DLM_RESULTS, GII_RESULTS, VIF_RESULTS } from "@/data/results";
import {
  DATA,
  METRIC_KEYS,
  YEARS,
  lastReal,
  periodChangePct,
  provenanceCounts,
  type Country,
  type MetricKey,
} from "@/data/series";
import { formatValue, signedPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  Lightbulb,
  Sigma,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

function KpiCard({
  metric,
  note,
}: {
  metric: MetricKey;
  note?: { Italy?: string; Finland?: string };
}) {
  const def = METRIC_BY_ID[metric];
  const values = (["Italy", "Finland"] as Country[]).map((c) => {
    const pts = DATA[c][metric];
    const last = lastReal(pts);
    return { c, last, delta: periodChangePct(pts) };
  });
  const max = Math.max(...values.map((v) => v.last?.value ?? 0));
  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <def.icon className="size-4 text-muted-foreground" aria-hidden />
          {def.short}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {values.map(({ c, last, delta }) => (
          <div key={c}>
            <div className="flex items-baseline gap-2">
              <CountryDot country={c} />
              <span className="text-xs text-muted-foreground">{c}</span>
              <span className="ml-auto text-lg font-semibold tabular">
                {last?.value !== null && last?.value !== undefined
                  ? formatValue(def.kind, last.value)
                  : "—"}
              </span>
              {delta !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] tabular",
                    delta >= 0 ? "text-italy" : "text-rose",
                  )}
                >
                  {delta >= 0 ? (
                    <TrendingUp className="size-3" aria-hidden />
                  ) : (
                    <TrendingDown className="size-3" aria-hidden />
                  )}
                  {signedPct(delta, 0)}
                </span>
              )}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="kpi-bar h-full rounded-full"
                style={{
                  width: `${max > 0 ? ((last?.value ?? 0) / max) * 100 : 0}%`,
                  background: c === "Italy" ? "var(--italy)" : "var(--finland)",
                }}
              />
            </div>
            {note?.[c] && (
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {note[c]}
              </div>
            )}
          </div>
        ))}
        <Link
          to={`/metrics/${def.slug}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-finland hover:underline"
        >
          Explore {def.short.toLowerCase()}{" "}
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { openChat } = useChatDock();
  const navigate = useNavigate();
  const prov = provenanceCounts();
  const cells = Object.values(prov).reduce((a, b) => a + b, 0);
  const italyJournals = DATA.Italy.journal_articles.map((p) => p.value);
  const finlandExports = DATA.Finland.hitech_exports_usd.map((p) => p.value);

  return (
    <div className="space-y-14">
      {/* ————— Hero ————— */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="stagger space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-italy" aria-hidden />
            Italy × Finland
            <span className="size-1.5 rounded-full bg-finland" aria-hidden />
            2004–2025
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Money in.
            <br />
            <span className="bg-gradient-to-r from-italy via-cyan to-finland bg-clip-text text-transparent">
              Invention out?
            </span>
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            A 22-year, two-country autopsy of the link between economic
            conditions and innovation output. Italy's science outruns its
            patents. Finland's inputs outrun its exports. Eleven indicators,
            three statistical models — and an analyst you can interrogate.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button render={<Link to="/metrics/hitech-exports" />}>
              Follow the divergence{" "}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button variant="outline" render={<Link to="/methodology" />}>
              <BookOpen className="size-4" aria-hidden /> Methodology
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                openChat(
                  "Give me the two-paragraph story of Italy vs Finland innovation, 2004–2025.",
                )
              }
            >
              <Sparkles className="size-4 text-gold" aria-hidden /> Ask the
              analyst
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground tabular">
            <span>{YEARS.length} years</span>
            <span>{METRIC_KEYS.length} indicators</span>
            <span>2 economies</span>
            <span>3 models</span>
            <span>
              {cells} data cells · {prov.real} observed
            </span>
          </div>
        </div>
        <div className="rise">
          <FlagshipChart />
        </div>
      </section>

      {/* ————— KPIs ————— */}
      <section className="space-y-5">
        <SectionTitle
          eyebrow="State of play · latest observations"
          title="Two systems, side by side"
          lede="Absolute values with the 2004→2025 change. Scale differs ~10× by population — every indicator page offers per-capita and indexed views."
        />
        <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            metric="gii_score"
            note={{
              Italy: "rank 28/139 · in 37th / out 19th",
              Finland: "rank 7/139 · in 5th / out 10th",
            }}
          />
          <KpiCard
            metric="rd_pct_gdp"
            note={{
              Italy: "business R&D only 0.76% GDP",
              Finland: "Nokia era peaked at 3.73%",
            }}
          />
          <KpiCard
            metric="hitech_exports_usd"
            note={{
              Italy: "pharma-led surge since 2020",
              Finland: "−72% from the 2008 peak",
            }}
          />
          <KpiCard
            metric="patents_residents"
            note={{
              Italy: "flat for two decades",
              Finland: "2025 EPO rebound ≈ ⅔ Nokia",
            }}
          />
        </div>
      </section>

      {/* ————— Diagnoses ————— */}
      <section className="space-y-5">
        <SectionTitle
          eyebrow="The qualitative read"
          title="Two failure modes of the same machine"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glow-italy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CountryDot country="Italy" /> The European paradox, in one
                country
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Sparkline
                values={italyJournals}
                color="var(--italy)"
                height={48}
              />
              <div className="text-[11px] text-muted-foreground">
                Journal articles, 2004–2025 · +78%
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2">
                  <Lightbulb
                    className="mt-0.5 size-4 shrink-0 text-italy"
                    aria-hidden
                  />
                  World-class science: 2nd in Europe by volume, ~3% of the
                  world's most-cited output — yet resident patenting is flat and
                  EPO filings are ~1/5 of Germany's.
                </li>
                <li className="flex gap-2">
                  <FlaskConical
                    className="mt-0.5 size-4 shrink-0 text-italy"
                    aria-hidden
                  />
                  The translation layer is thin: SMEs too small to fund R&D (1
                  in 10 reports any), TTOs understaffed, VC at 0.03% of GDP.
                </li>
                <li className="flex gap-2">
                  <TrendingUp
                    className="mt-0.5 size-4 shrink-0 text-italy"
                    aria-hidden
                  />
                  The 2020–24 export surge is real but narrow: pharma plus a
                  7–12-year-old investment cycle finally monetising.
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/metrics/journal-articles" />}
                >
                  The science <ArrowUpRight className="size-3.5" aria-hidden />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/metrics/patents-residents" />}
                >
                  The gap <ArrowUpRight className="size-3.5" aria-hidden />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-finland">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CountryDot country="Finland" /> When the giant tree falls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Sparkline
                values={finlandExports}
                color="var(--finland)"
                height={48}
              />
              <div className="text-[11px] text-muted-foreground">
                Hi-tech exports, 2004–2025 · −72% in 2008–2013
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2">
                  <TrendingDown
                    className="mt-0.5 size-4 shrink-0 text-finland"
                    aria-hidden
                  />
                  Nokia was the anchor tenant: ~43% of EPO patents, 37% of
                  national R&D, &gt;20% of exports. When it fell, the measurable
                  innovation system fell with it.
                </li>
                <li className="flex gap-2">
                  <FlaskConical
                    className="mt-0.5 size-4 shrink-0 text-finland"
                    aria-hidden
                  />
                  R&D intensity dropped 3.73% → 2.75% of GDP; recovery to 3.19%
                  is real but partly public, and business R&D is still ~20%
                  below 2009.
                </li>
                <li className="flex gap-2">
                  <Sparkles
                    className="mt-0.5 size-4 shrink-0 text-finland"
                    aria-hidden
                  />
                  Today's problem is conversion: GII inputs 5th, outputs 10th —
                  vibrant startups, no replacement anchor at scale.
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/metrics/hitech-exports" />}
                >
                  The collapse <ArrowUpRight className="size-3.5" aria-hidden />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/metrics/gii-score" />}
                >
                  The gap <ArrowUpRight className="size-3.5" aria-hidden />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ————— Analyses ————— */}
      <section className="space-y-5">
        <SectionTitle
          eyebrow="Go deeper"
          title="Three statistical analyses"
          lede="Same discipline everywhere: small-N, HC3 robust errors, descriptive associations only."
        />
        <div className="stagger grid gap-4 md:grid-cols-3">
          {[
            {
              to: "/analysis/vif",
              icon: Sigma,
              title: "VIF regression",
              finding:
                "GDP per capita carries Italy's exports; patents carry Finland's. R&D intensity is invisible contemporaneously in both.",
              chips: [
                `R² ${VIF_RESULTS.Italy.log.fit.r_squared.toFixed(2)} / ${VIF_RESULTS.Finland.log.fit.r_squared.toFixed(2)}`,
                "N = 22",
                "log target",
              ],
            },
            {
              to: "/analysis/dlm",
              icon: Timer,
              title: "Distributed lag",
              finding:
                "R&D lags 0–5 tested: Italy shows a marginal negative-now / positive-at-lag-4 pattern; Finland nothing robust under HC3.",
              chips: ["N = 17", "lags 0–5", "I(1) warning"],
            },
            {
              to: "/analysis/gii",
              icon: Sparkles,
              title: "GII drivers",
              finding: `No significant linear driver of the GII score at N = ${GII_RESULTS.Italy.n_obs}/${GII_RESULTS.Finland.n_obs} — adjusted R² is negative in both.`,
              chips: [
                `F p = ${GII_RESULTS.Italy.fit.f_pvalue?.toFixed(2)}`,
                "tautology-guarded",
                "lag sensitivity",
              ],
            },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-ring">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <a.icon className="size-4 text-violet" aria-hidden />
                    {a.title}
                    <ArrowUpRight
                      className="ml-auto size-4 text-muted-foreground transition-colors group-hover:text-finland"
                      aria-hidden
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {a.finding}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.chips.map((c) => (
                      <Badge
                        key={c}
                        variant="outline"
                        className="text-[10px] text-muted-foreground"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          DLM long-run note: cumulative multipliers are{" "}
          {`$${(DLM_RESULTS.Italy.lag_table.reduce((s, l) => s + l.coef, 0) / 1e9).toFixed(1)}B`}{" "}
          (Italy) and{" "}
          {`+$${(DLM_RESULTS.Finland.lag_table.reduce((s, l) => s + l.coef, 0) / 1e9).toFixed(1)}B`}{" "}
          (Finland) per +1pp R&D — associative, not causal.
        </p>
      </section>

      {/* ————— Shock timeline ————— */}
      <section className="space-y-5">
        <SectionTitle
          eyebrow="events.json"
          title="The shock timeline"
          lede="Every band on every chart comes from this annotated set. Click an event to open its indicator, zoomed to the shock."
        />
        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
          {EVENTS.map((e) => (
            <Tooltip key={e.id}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/metrics/${EVENT_TARGET_METRIC[e.id] ?? "hitech-exports"}`,
                        {
                          state: { eventId: e.id },
                        },
                      )
                    }
                    className="w-[240px] shrink-0 snap-start rounded-xl border border-border bg-card/80 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-ring"
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: `var(--${e.severity === "high" ? "rose" : e.severity === "medium" ? "gold" : "cyan"})`,
                    }}
                  />
                }
              >
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular">
                  <SeverityDot severity={e.severity} />
                  {e.start === e.end ? e.start : `${e.start}–${e.end}`}
                  <span className="ml-auto">{e.countries.join(" · ")}</span>
                </div>
                <div className="mt-1.5 text-sm font-semibold leading-snug">
                  {e.label}
                </div>
                <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {e.description}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] text-xs">
                {e.description}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      {/* ————— Method CTA ————— */}
      <section>
        <Card className="border-violet/40 bg-gradient-to-br from-violet/10 via-card to-finland/10">
          <CardContent className="flex flex-wrap items-center gap-4 py-6">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                How this was built — and why it refuses causal claims
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Sources, interpolation &amp; extrapolation provenance, the VIF≤5
                discipline, HC3 errors, tautology exclusions, and the I(1)
                warning on the lag model.
              </p>
            </div>
            <Button variant="outline" render={<Link to="/methodology" />}>
              Read the methodology <ArrowRight className="size-4" aria-hidden />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
