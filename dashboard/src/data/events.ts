import type { Country } from "./series";

export type Severity = "high" | "medium" | "low";

export interface ShockEvent {
  id: string;
  start: number;
  end: number;
  label: string;
  description: string;
  severity: Severity;
  features: string[];
  countries: Country[];
}

/** Verbatim from data/processed/events.json (schema_version 1). */
export const EVENTS: ShockEvent[] = [
  {
    id: "gfc",
    start: 2007,
    end: 2009,
    label: "Global Financial Crisis",
    description:
      "Financial crisis → global trade collapse. Finland hi-tech exports fell ~48% in 2009.",
    severity: "high",
    features: [
      "hitech_exports_usd",
      "log_hitech_exports_usd",
      "rd_pct_gdp",
      "gii_score",
    ],
    countries: ["Italy", "Finland"],
  },
  {
    id: "nokia-decline",
    start: 2009,
    end: 2014,
    label: "Nokia decline → Microsoft acquisition",
    description:
      "Nokia (~20% of Finland exports in 2007) collapsed; mobile business sold to Microsoft in 2013–14. Finland hi-tech exports halved; R&D intensity fell 3.7% → 2.75%.",
    severity: "high",
    features: ["hitech_exports_usd", "rd_pct_gdp", "patents_total"],
    countries: ["Finland"],
  },
  {
    id: "eurozone",
    start: 2011,
    end: 2013,
    label: "Eurozone sovereign debt crisis",
    description:
      "Italian spreads spiked, GDP fell. R&D% rose mechanically (GDP in denominator) while exports stagnated.",
    severity: "medium",
    features: ["hitech_exports_usd", "rd_pct_gdp", "gov_debt_pct_gdp"],
    countries: ["Italy"],
  },
  {
    id: "covid",
    start: 2020,
    end: 2021,
    label: "COVID-19 pandemic",
    description:
      "Trade disruption; both countries saw export volatility and GII declines.",
    severity: "high",
    features: ["hitech_exports_usd", "gii_score", "gdp_ppp_percapita"],
    countries: ["Italy", "Finland"],
  },
  {
    id: "italy-surge",
    start: 2022,
    end: 2024,
    label: "Italy export surge (+55% in 3y)",
    description:
      "EUR/USD swing + defence/electronics boom. Italy hi-tech exports rose from $45B → $60B.",
    severity: "medium",
    features: ["hitech_exports_usd"],
    countries: ["Italy"],
  },
  {
    id: "gii-start-italy",
    start: 2011,
    end: 2011,
    label: "GII first published (Italy)",
    description: "Global Innovation Index data begins for Italy in 2011.",
    severity: "low",
    features: ["gii_score"],
    countries: ["Italy"],
  },
  {
    id: "gii-start-finland",
    start: 2013,
    end: 2013,
    label: "GII first published (Finland)",
    description: "Global Innovation Index data begins for Finland in 2013.",
    severity: "low",
    features: ["gii_score"],
    countries: ["Finland"],
  },
];

export const SHORT_EVENT_LABEL: Record<string, string> = {
  gfc: "GFC",
  "nokia-decline": "Nokia",
  eurozone: "Euro crisis",
  covid: "Pandemic",
  "italy-surge": "IT surge",
  "gii-start-italy": "GII starts",
  "gii-start-finland": "GII starts",
};

/** Primary metric page each event links to from the overview timeline. */
export const EVENT_TARGET_METRIC: Record<string, string> = {
  gfc: "hitech-exports",
  "nokia-decline": "hitech-exports",
  eurozone: "government-debt",
  covid: "gii-score",
  "italy-surge": "hitech-exports",
  "gii-start-italy": "gii-score",
  "gii-start-finland": "gii-score",
};

export function eventsFor(
  features: string[],
  countries: Country[],
): ShockEvent[] {
  return EVENTS.filter(
    (e) =>
      e.features.some((f) => features.includes(f)) &&
      e.countries.some((c) => countries.includes(c)),
  );
}

export function eventsActiveAt(
  events: ShockEvent[],
  year: number,
): ShockEvent[] {
  return events.filter((e) => year >= e.start && year <= e.end);
}

export function eventById(id: string): ShockEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}
