import type { ValueKind } from "@/lib/format";
import {
    Banknote,
    BookOpen,
    FlaskConical,
    Globe,
    Landmark,
    Lightbulb,
    Percent,
    Scale,
    Sparkles,
    TrendingUp,
    Users,
    type LucideIcon,
} from "lucide-react";
import type { MetricKey } from "./series";
import { TAKES, type Take } from "./takes";

export type MetricGroup = "outputs" | "inputs" | "economy";

export const GROUP_LABEL: Record<MetricGroup, string> = {
  outputs: "Innovation outputs",
  inputs: "Inputs & index",
  economy: "Economy & society",
};

export interface MetricDef {
  id: MetricKey;
  slug: string;
  label: string;
  short: string;
  unit: string;
  wb: string;
  group: MetricGroup;
  icon: LucideIcon;
  kind: ValueKind;
  blurb: string;
  perMillion: boolean;
  perCapita: boolean;
  eventFeatures: string[];
  modelNotes: { Italy: string; Finland: string };
  takeItaly: Take;
  takeFinland: Take;
}

function def(d: Omit<MetricDef, "takeItaly" | "takeFinland">): MetricDef {
  return {
    ...d,
    takeItaly: TAKES[d.id].Italy,
    takeFinland: TAKES[d.id].Finland,
  };
}

export const METRICS: MetricDef[] = [
  def({
    id: "hitech_exports_usd",
    slug: "hitech-exports",
    label: "Hi-tech exports (current US$)",
    short: "Hi-tech exports",
    unit: "current US$",
    wb: "TX.VAL.TECH.CD",
    group: "outputs",
    icon: TrendingUp,
    kind: "usd",
    blurb:
      "The commercialisation frontier — and the regression target of the VIF and DLM analyses. Italy's late surge and Finland's Nokia collapse live here.",
    perMillion: false,
    perCapita: true,
    eventFeatures: ["hitech_exports_usd", "log_hitech_exports_usd"],
    modelNotes: {
      Italy:
        "Target of Analysis 1 (log spec primary) and Analysis 2. Log-model R² = 0.933; only GDP per capita significant. The 2022–24 +55% surge is a flagged structural break.",
      Finland:
        "Target of Analyses 1–2. Log-model R² = 0.871; the 2009 −48% crash is the structural break behind the negative conditional GDP coefficient.",
    },
  }),
  def({
    id: "patents_residents",
    slug: "patents-residents",
    label: "Resident patent applications",
    short: "Resident patents",
    unit: "applications",
    wb: "IP.PAT.RESD",
    group: "outputs",
    icon: Lightbulb,
    kind: "count",
    blurb:
      "Domestic inventive output. Flat for two decades in Italy; Nokia-shaped volatility in Finland.",
    perMillion: true,
    perCapita: false,
    eventFeatures: ["patents_total"],
    modelNotes: {
      Italy:
        "Enters models via patents_total (residents + non-residents): retained by VIF, not significant (p = 0.164, HC3).",
      Finland:
        "Via patents_total: the standout output predictor — +0.087% exports per patent (p = 0.011, HC3), ≈ +8.7% per +100 patents.",
    },
  }),
  def({
    id: "patents_nonresidents",
    slug: "patents-nonresidents",
    label: "Non-resident patent applications",
    short: "Non-resident patents",
    unit: "applications",
    wb: "IP.PAT.NRES",
    group: "outputs",
    icon: Globe,
    kind: "count",
    blurb:
      "Foreign filings at the national office — a small, stable minority in Italy; a vanishing series in Finland.",
    perMillion: true,
    perCapita: false,
    eventFeatures: ["patents_total"],
    modelNotes: {
      Italy:
        "Combined into patents_total for modelling. The raw 2015 spike (9,687) is a flagged methodological outlier, replaced by interpolation here.",
      Finland:
        "Combined into patents_total. The 2024 value (59) is flagged as a possible reporting artefact; 2025 is extrapolated.",
    },
  }),
  def({
    id: "journal_articles",
    slug: "journal-articles",
    label: "Scientific & technical journal articles",
    short: "Journal articles",
    unit: "articles",
    wb: "IP.JRN.ARTC.SC",
    group: "outputs",
    icon: BookOpen,
    kind: "count",
    blurb:
      "The science base. Italy's strongest metric (+78%); Finland's saturated excellence (≈2× Italy per capita).",
    perMillion: true,
    perCapita: false,
    eventFeatures: [],
    modelNotes: {
      Italy:
        "Dropped first by VIF (VIF 61.7 — collinear with the trending block). Excluded from the GII model as tautological with the index's knowledge pillar.",
      Finland:
        "Dropped first by VIF (VIF 22.6). Excluded from the GII model as tautological. The science base never collapsed — the translation layer did.",
    },
  }),
  def({
    id: "hitech_pct_manufactured",
    slug: "hitech-share",
    label: "Hi-tech share of manufactured exports",
    short: "Hi-tech share",
    unit: "% of mfg. exports",
    wb: "TX.VAL.TECH.MF.ZS",
    group: "outputs",
    icon: Percent,
    kind: "pct1",
    blurb:
      "The composition check: strips price noise from the export story. Excluded from export models as a mathematical identity.",
    perMillion: false,
    perCapita: false,
    eventFeatures: ["hitech_exports_usd"],
    modelNotes: {
      Italy:
        "Never a predictor of exports (numerator = target). Retained in the GII model with a partial-tautology flag: −0.23 pts per pp, n.s. (p = 0.50).",
      Finland:
        "Same exclusion. GII model: −0.25 pts per pp, n.s. (p = 0.79). The share series itself confirms a real compositional collapse, ~22% → ~9%.",
    },
  }),
  def({
    id: "rd_pct_gdp",
    slug: "rd-intensity",
    label: "R&D expenditure (% of GDP)",
    short: "R&D intensity",
    unit: "% of GDP",
    wb: "GB.XPD.RSDV.GD.ZS",
    group: "inputs",
    icon: FlaskConical,
    kind: "pct2",
    blurb:
      "The headline innovation input — and the predictor whose effect the whole project hunts: contemporaneous, lagged, or invisible.",
    perMillion: false,
    perCapita: false,
    eventFeatures: ["rd_pct_gdp"],
    modelNotes: {
      Italy:
        "VIF: dropped (collinear with GDP pc). DLM: lag-0 −$66.6B (p = 0.056) and lag-4 +$60.1B (p = 0.057), marginal at 10% only. GII: retained lag-0, n.s.",
      Finland:
        "VIF: retained but essentially zero (p = 0.89). DLM: nothing survives HC3; single-lag robustness +$3.15B (p < 0.001) carries shared-trend risk. GII: n.s.",
    },
  }),
  def({
    id: "gii_score",
    slug: "gii-score",
    label: "Global Innovation Index (score)",
    short: "GII score",
    unit: "score 0–100",
    wb: "WIPO GII",
    group: "inputs",
    icon: Sparkles,
    kind: "pts1",
    blurb:
      "The composite verdict. Italy: efficient conversion of modest inputs. Finland: excellent inputs, second-tier outputs.",
    perMillion: false,
    perCapita: false,
    eventFeatures: ["gii_score"],
    modelNotes: {
      Italy:
        "Target of Analysis 3. N = 15 (2011–2025); R² = 0.30, adjusted R² = −0.08; no coefficient significant. Lag signs flip: +11.4 → −8.8 → −16.3.",
      Finland:
        "Target of Analysis 3. N = 13 (2013–2025); R² = 0.30, adjusted R² = −0.21; nothing significant. Lag coefficients rise 0.67 → 1.40 → 1.86 but p ≥ 0.62.",
    },
  }),
  def({
    id: "gdp_ppp_percapita",
    slug: "gdp-per-capita",
    label: "GDP per capita (PPP, current int'l $)",
    short: "GDP per capita",
    unit: "PPP $",
    wb: "NY.GDP.PCAP.PP.CD",
    group: "economy",
    icon: Banknote,
    kind: "money0",
    blurb:
      "Development level — the strongest, most consistent export correlate in the VIF models, with a diagnostic sign flip between countries.",
    perMillion: false,
    perCapita: false,
    eventFeatures: ["gdp_ppp_percapita"],
    modelNotes: {
      Italy:
        "VIF log model: +2.7% exports per +$1,000 (p < 0.001, HC3) — the only significant predictor. Also the DLM control variable.",
      Finland:
        "VIF log model: −1.7% per +$1,000 (p < 0.001) — conditional-on-patents-and-R&D cycle artefact, not 'income reduces exports'.",
    },
  }),
  def({
    id: "gov_debt_pct_gdp",
    slug: "government-debt",
    label: "General government gross debt (% of GDP)",
    short: "Government debt",
    unit: "% of GDP",
    wb: "IMF WEO",
    group: "economy",
    icon: Landmark,
    kind: "pct1",
    blurb:
      "The fiscal corridor for public R&D. Italy: a binding inheritance. Finland: a narrowing one.",
    perMillion: false,
    perCapita: false,
    eventFeatures: ["gov_debt_pct_gdp"],
    modelNotes: {
      Italy:
        "VIF: retained, negative but n.s. under HC3 (p = 0.218; significant under plain SEs — a caution about robust errors). GII: n.s.",
      Finland:
        "VIF: dropped (VIF 13.4 after the first elimination). GII: retained, n.s. (p = 0.69). The constraint is trajectory, not level.",
    },
  }),
  def({
    id: "gini_index",
    slug: "gini",
    label: "Gini index (income inequality)",
    short: "Gini index",
    unit: "0–100",
    wb: "SI.POV.GINI",
    group: "economy",
    icon: Scale,
    kind: "pts1",
    blurb:
      "Diffusion capacity. Italy's regional divide brakes absorption; Finland's equality enables inputs but doesn't translate them.",
    perMillion: false,
    perCapita: false,
    eventFeatures: [],
    modelNotes: {
      Italy:
        "VIF: retained, n.s. (p = 0.463). GII: n.s. The mechanism is spatial (North–South absorptive capacity), not a national linear lever.",
      Finland:
        "VIF: 'significant' positive (p < 0.001) — explicitly flagged as a shared-trend artefact over a 26.8–28.3 range. Do not read as policy.",
    },
  }),
  def({
    id: "population",
    slug: "population",
    label: "Population (total)",
    short: "Population",
    unit: "persons",
    wb: "SP.POP.TOTL",
    group: "economy",
    icon: Users,
    kind: "pop",
    blurb:
      "The denominator that makes Italy–Finland comparisons fair. Deliberately excluded from the regression pools.",
    perMillion: false,
    perCapita: false,
    eventFeatures: [],
    modelNotes: {
      Italy:
        "Excluded from the VIF pool: nearly flat within-country, collinear, weak prior. Powers every per-capita view on this dashboard.",
      Finland:
        "Same exclusion, same role. Finland ≈ 5.6M vs Italy ≈ 58.9M — a ~10.5× scale gap the per-capita modes neutralise.",
    },
  }),
];

export const METRIC_BY_SLUG: Record<string, MetricDef> = Object.fromEntries(
  METRICS.map((m) => [m.slug, m]),
);

export const METRIC_BY_ID: Record<MetricKey, MetricDef> = Object.fromEntries(
  METRICS.map((m) => [m.id, m]),
) as Record<MetricKey, MetricDef>;

export function metricNeighbors(slug: string): {
  prev: MetricDef | null;
  next: MetricDef | null;
} {
  const i = METRICS.findIndex((m) => m.slug === slug);
  return {
    prev: i > 0 ? METRICS[i - 1] : null,
    next: i >= 0 && i < METRICS.length - 1 ? METRICS[i + 1] : null,
  };
}
