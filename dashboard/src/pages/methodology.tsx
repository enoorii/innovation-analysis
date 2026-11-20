import { AnalysisHero, CaveatCard } from "@/components/analysis";
import { SectionTitle } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { METRICS } from "@/data/metrics";
import { provenanceCounts } from "@/data/series";
import { Database, Filter, GitBranch, Layers, Sigma } from "lucide-react";

const PIPELINE = [
  {
    icon: Database,
    title: "Raw pull",
    body: "World Bank WDI series + IMF WEO debt + WIPO GII, one row per country-year, 2004–2025 (data/raw/*.xlsx).",
  },
  {
    icon: Filter,
    title: "Clean & rename",
    body: "Snake_case keys, unit harmonisation, population join. Notebook 01_data_preparation.ipynb.",
  },
  {
    icon: GitBranch,
    title: "Gap treatment",
    body: "Interior gaps interpolated; edges linearly extrapolated (lead/trail); every cell tagged with provenance. GII pre-publication years stay missing — never fabricated.",
  },
  {
    icon: Layers,
    title: "Feature engineering",
    body: "Logs, lags 1–2, YoY growth, 3-yr means, per-capita normalisations, efficiency ratios — all provenance-tracked in dashboard_data.json.",
  },
  {
    icon: Sigma,
    title: "Three analyses",
    body: "VIF→OLS (HC3) on exports; distributed lag 0–5 on exports; VIF→OLS (HC3) on GII with tautology exclusions and lag sensitivity.",
  },
];

const EXCLUSIONS = [
  {
    feature: "hitech_pct_manufactured",
    reason:
      "Tautological: numerator is the export target itself. Early inclusion produced spurious significance and inflated R².",
    evidence: "identity",
  },
  {
    feature: "rd_per_capita_ppp",
    reason:
      "Algebraic: rd_pct_gdp × gdp_ppp_percapita. Generated a fake negative 'significant' coefficient in an earlier Finland run.",
    evidence: "VIF > 15,000",
  },
  {
    feature: "patents_per_million",
    reason:
      "Algebraic: patents_total ÷ population. Arbitrary drop-selection against its own numerator.",
    evidence: "VIF > 20,000",
  },
  {
    feature: "population",
    reason:
      "Weak prior: nearly flat within each country; collinear with patents and GDP pc; carries almost no signal for export movements.",
    evidence: "flat series",
  },
  {
    feature: "patents / articles / export levels (GII model)",
    reason:
      "Ingredients of the GII composite itself — regressing the index on them is partially circular.",
    evidence: "composite pillars",
  },
];

export default function MethodologyPage() {
  const prov = provenanceCounts();
  const total = Object.values(prov).reduce((a, b) => a + b, 0);
  const extrapolated = prov.extrapolated_lead + prov.extrapolated_trail;

  return (
    <div className="space-y-12">
      <AnalysisHero
        index="—"
        title="Methodology — why these methods, and what they refuse to claim"
        lede="A comparative, descriptive design: two countries, 22 annual observations each, three small-sample regressions with robust errors and aggressive collinearity discipline. The unit of analysis is the country-year. Nothing here identifies causation — and the design says so out loud at every step."
        chips={[
          { label: "Design", value: "comparative, per-country" },
          { label: "Unit", value: "country-year" },
          { label: "Window", value: "2004–2025" },
          { label: "Errors", value: "HC3 authoritative" },
        ]}
        ask="Explain the methodology: why VIF threshold 5, why HC3, why the log target, and why no causal claims?"
      />

      {/* Sources */}
      <section id="sources" className="scroll-mt-24 space-y-4">
        <SectionTitle
          eyebrow="01"
          title="Indicators & sources"
          lede="Eleven indicators. Codes are World Bank WDI series unless noted; debt follows IMF WEO and GII follows WIPO's post-2011 methodology."
        />
        <div className="overflow-x-auto rounded-xl border border-border bg-card/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Series code</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Role in the analyses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {METRICS.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <m.icon
                        className="size-3.5 text-muted-foreground"
                        aria-hidden
                      />
                      {m.short}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.wb}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {m.unit}
                  </TableCell>
                  <TableCell className="max-w-[360px] text-xs text-muted-foreground">
                    {m.id === "hitech_exports_usd"
                      ? "Target of Analyses 1–2 (log primary)."
                      : m.id === "gii_score"
                        ? "Target of Analysis 3."
                        : m.id === "population"
                          ? "Normalisation only; excluded from pools."
                          : m.id === "hitech_pct_manufactured"
                            ? "Composition check; excluded from export models (identity); flagged in GII model."
                            : m.id === "patents_nonresidents" ||
                                m.id === "patents_residents"
                              ? "Combined as patents_total in the models."
                              : "Candidate predictor (VIF-selected)."}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="scroll-mt-24 space-y-4">
        <SectionTitle
          eyebrow="02"
          title="Pipeline & provenance"
          lede="Every plotted cell knows whether it was observed, interpolated, or extrapolated — the charts mark estimated points, and the tooltips name them."
        />
        <div className="stagger grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((s, i) => (
            <Card key={s.title} className="relative">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted/60">
                    <s.icon className="size-3.5 text-finland" aria-hidden />
                  </span>
                  {i + 1}. {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            Live cell audit ({total} cells):
          </span>
          <Badge variant="outline" className="text-muted-foreground">
            {prov.real} observed
          </Badge>
          <Badge variant="outline" className="border-gold/50 text-gold">
            {prov.interpolated} interpolated
          </Badge>
          <Badge variant="outline" className="border-gold/50 text-gold">
            {extrapolated} extrapolated (edges)
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {prov.missing} missing (GII pre-publication)
          </Badge>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Known caveats carried from the source notes: Italy's raw 2015
          non-resident patent spike (9,687) is a methodological outlier replaced
          by interpolation; Finland's 2024 non-resident count (59) may be a
          reporting artefact; 2024–25 journal/R&D tails are extrapolations, not
          observations.
        </p>
      </section>

      {/* Method choices */}
      <section id="choices" className="scroll-mt-24 space-y-4">
        <SectionTitle eyebrow="03" title="Method choices & exclusions" />
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Why a log target?</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Export levels span nearly two orders of magnitude across the
              sample. log(1 + exports) makes coefficients readable as
              approximate percentage effects and dampens scale-driven
              heteroskedasticity. Levels are kept as a robustness view, never
              the headline.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Why VIF ≤ 5, one drop per iteration?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Trending macro series are heavily collinear. Backward elimination
              removes exactly the worst offender per pass and refits, so the
              surviving set is stable and interpretable (all final VIFs ≤ 5).
              Dropping several at once would let numerical coincidence pick the
              winners.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Why HC3, and why per-country?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              GFC and pandemic shocks change residual variance; Finland's
              residuals also fail normality (Omnibus p = 0.020). HC3 is
              authoritative wherever OLS disagrees. No pooling: Italy ≈ 59M
              people vs Finland ≈ 5.6M, and the innovation systems differ
              structurally — a pooled slope would average two different
              machines.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Why a DLM, and why the warning?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Analysis 1 found no contemporaneous R&D association, so lags 0–5
              are the natural follow-up. But all series are I(1): a levels DLM
              risks spurious fit, lag VIFs reach 66, and N shrinks to 17. The
              dashboard prints the metadata warning verbatim and treats the
              profile as descriptive until an ARDL/VECM pass exists.
            </CardContent>
          </Card>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Excluded from pools</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXCLUSIONS.map((e) => (
                <TableRow key={e.feature}>
                  <TableCell className="font-mono text-xs">
                    {e.feature}
                  </TableCell>
                  <TableCell className="max-w-[420px] text-xs text-muted-foreground">
                    {e.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-rose/40 text-[10px] text-rose"
                    >
                      {e.evidence}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Limits */}
      <section id="limits" className="scroll-mt-24">
        <CaveatCard
          title="Limitations we state everywhere"
          items={[
            "Sample sizes: 22 (exports), 17 (DLM), 15/13 (GII). Only large effects are detectable; non-significance is not absence.",
            "Trending levels inflate R²; logging mitigates but does not remove shared-trend fit. First-differences/ARDL are the upgrade path.",
            "HC3 fixes heteroskedasticity, not autocorrelation (Italy DW ≈ 1.18). Newey–West would be needed for stronger inference.",
            "Structural breaks — Nokia 2009–2014, Italy's 2022–24 surge — sit inside every window; break dummies are future work.",
            "Gini coefficients extrapolate full points from ±1.5-point ranges: statistically significant, semantically fragile.",
            "No causal claims anywhere: 'X causes Y' is unsupported by this design. Panel data, quasi-experiments or time-series causal models would be required.",
          ]}
        />
      </section>

      {/* Reproducibility */}
      <section id="repro" className="scroll-mt-24 space-y-4">
        <SectionTitle eyebrow="04" title="Reproducibility & stack" />
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Run it</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 font-mono text-[11px] leading-relaxed">
                {`# analysis (notebook 01, cells F2–F9)
#   TARGET_LOG = log_hitech_exports_usd
#   VIF_THRESHOLD = 5.0

# backend — FastAPI + ChromaDB RAG on :9123
cd backend && uv sync && uv run poe dev
uv run python scripts/ingest_knowledge.py   # (re)ingest knowledge/*.md

# dashboard — Vite dev proxy /api → :9123
cd dashboard && pnpm install && pnpm dev`}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React 19",
                  "Vite",
                  "TypeScript",
                  "Tailwind 4",
                  "shadcn (Base UI)",
                  "Recharts",
                  "TanStack Query",
                  "FastAPI",
                  "ChromaDB",
                  "statsmodels",
                  "pandas",
                ].map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-[10px] text-muted-foreground"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Charts use Recharts — the library shadcn's chart theming targets
                — driven by CSS variables so light/dark themes and exports stay
                consistent. Chart data is bundled from{" "}
                <span className="font-mono">data/processed/*.json</span>; the AI
                analyst retrieves from the markdown knowledge base (VIF, DLM,
                GII, country analyses) and answers with source citations.
                Session memory lives server-side, keyed by a client-persisted
                UUID.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
