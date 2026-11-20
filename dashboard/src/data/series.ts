/**
 * Bundled from data/processed/dashboard_data.json (generated 2026-11-19).
 * Values are the processed series; provenance tags mirror the `__prov`
 * fields exactly (real / interpolated / extrapolated_lead / _trail / missing).
 */

export type Country = "Italy" | "Finland";
export const COUNTRIES: Country[] = ["Italy", "Finland"];

export type Prov =
  | "real"
  | "interpolated"
  | "extrapolated_lead"
  | "extrapolated_trail"
  | "missing";

export type MetricKey =
  | "patents_residents"
  | "patents_nonresidents"
  | "journal_articles"
  | "rd_pct_gdp"
  | "hitech_exports_usd"
  | "hitech_pct_manufactured"
  | "gini_index"
  | "gdp_ppp_percapita"
  | "gov_debt_pct_gdp"
  | "population"
  | "gii_score";

export const FIRST_YEAR = 2004;
export const LAST_YEAR = 2025;
export const YEARS: number[] = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, i) => FIRST_YEAR + i,
);

export interface YearPoint {
  year: number;
  value: number | null;
  prov: Prov;
}

type Columns = Record<MetricKey, (number | null)[]>;
type ProvMap = Partial<Record<number, Partial<Record<MetricKey, Prov>>>>;

const italyCols: Columns = {
  patents_residents: [
    11256, 10589, 9922, 9255, 8588, 8814, 8877, 8794, 8439, 8307, 8601, 8724.5,
    8848, 8643, 8921, 9229, 10061, 10281, 8440, 8478, 9120, 9762,
  ],
  patents_nonresidents: [
    897, 888, 879, 870, 861, 903, 846, 927, 871, 905, 781, 877, 973, 1031, 900,
    898, 947, 797, 781, 1145, 1188, 1188,
  ],
  journal_articles: [
    44324.39, 47758.26, 50510.85, 53839.81, 55717.83, 57761.05, 57848.57,
    59651.73, 63135.68, 66220.78, 67444.12, 69382.56, 69301.08, 70101.05,
    71037.79, 73935.81, 80141.63, 85699.51, 83236.9, 82770.89, 82304.88,
    81838.87,
  ],
  rd_pct_gdp: [
    1.04662, 1.04057, 1.07903, 1.12421, 1.15548, 1.21261, 1.21296, 1.19531,
    1.25559, 1.29425, 1.33148, 1.33213, 1.35915, 1.36393, 1.41934, 1.45558,
    1.49869, 1.41065, 1.36563, 1.37935, 1.39307, 1.40679,
  ],
  hitech_exports_usd: [
    23381548831, 24777368483, 26256515057, 27823962961, 29484983562,
    25668989067, 29268480484, 33756014081, 29554731669, 31881513868,
    32867361936, 30092633847, 31090352971, 31877714689, 32468393639,
    32553693542, 32899224952, 36849787531, 45177261781, 52167641514,
    60156857365, 60156857365,
  ],
  hitech_pct_manufactured: [
    6.88, 6.83, 6.78, 6.73, 6.68, 7.8, 8.02, 7.97, 7.6, 7.77, 7.74, 8.15, 8.29,
    7.81, 7.48, 7.76, 8.59, 7.77, 9.16, 10.1, 12.3, 12.3,
  ],
  gini_index: [
    34.3, 33.8, 33.7, 32.9, 33.8, 33.8, 34.7, 35.1, 35.2, 34.9, 34.7, 35.4,
    35.2, 35.9, 35.2, 34.6, 35.2, 34.8, 33.7, 34.3, 34.3, 34.3,
  ],
  gdp_ppp_percapita: [
    29580.84, 30137.82, 32453.65, 34107.51, 35422.34, 34501.71, 34974.1,
    36392.28, 36281.1, 36459.3, 36665.69, 37384.38, 40482.56, 42142.34,
    43583.38, 46661.91, 44435.64, 49825.39, 57260.89, 60349.66, 62292.9,
    62802.51,
  ],
  gov_debt_pct_gdp: [
    104.7, 106.2, 106.3, 103.5, 105.8, 116.1, 118.8, 119.1, 125.9, 131.9, 134.8,
    134.8, 134.2, 133.7, 134.2, 133.9, 154.4, 145.8, 138.4, 133.9, 134.7, 137.1,
  ],
  population: [
    57828179, 58166682, 58399861, 58756247, 59211181, 59555454, 59819407,
    60026841, 60191247, 60311613, 60320707, 60229605, 60115223, 60002252,
    59877221, 59729081, 59438851, 59133173, 59013667, 58984216, 58952704,
    58915656,
  ],
  gii_score: [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    40.69,
    44.5,
    47.85,
    45.65,
    46.4,
    47.17,
    47.0,
    46.32,
    46.3,
    45.74,
    45.7,
    46.1,
    46.6,
    45.3,
    44.9,
  ],
};

const finlandCols: Columns = {
  patents_residents: [
    2011, 1830, 1816, 1804, 1799, 1806, 1731, 1650, 1698, 1596, 1419, 1289,
    1260, 1390, 1387, 1321, 1588, 1557, 1361, 1672, 1770, 1868,
  ],
  patents_nonresidents: [
    209, 229, 202, 211, 147, 127, 102, 124, 129, 141, 126, 127, 108, 139, 100,
    75, 97, 105, 86, 73, 59, 59,
  ],
  journal_articles: [
    8775.08, 9175.15, 9421.22, 9353.52, 9555.11, 9931.81, 9979.37, 10250.43,
    10479.48, 10714.78, 11089.54, 10992.47, 11169.41, 10919.92, 10966.86,
    11071.51, 11048.28, 11446.35, 11543.1, 11224.2, 10905.3, 10586.4,
  ],
  rd_pct_gdp: [
    3.30943, 3.32412, 3.33285, 3.33727, 3.53719, 3.73427, 3.70524, 3.62434,
    3.4095, 3.28462, 3.16344, 2.88826, 2.74716, 2.74723, 2.77601, 2.81534,
    2.93278, 3.01133, 2.982, 3.0938, 3.1419, 3.19,
  ],
  hitech_exports_usd: [
    12872316924, 13781283639, 14754436195, 15796307016, 16911748578, 8741751895,
    7052407551, 6421629231, 5472643075, 4695482191, 5102766370, 4250905950,
    3966871438, 4405324838, 4515449913, 4563293049, 4419553378, 5489726511,
    5314037683, 5292503329, 4907603981, 4943594796,
  ],
  hitech_pct_manufactured: [
    22.607354, 22.327488, 22.047622, 21.767756, 21.48789, 18.01598, 13.146864,
    11.075461, 10.473914, 9.026433, 10.052521, 10.184283, 10.05283, 9.657315,
    9.017654, 9.214701, 9.9823, 10.293754, 9.623928, 9.714023, 9.29, 9.19,
  ],
  gini_index: [
    27.9, 27.6, 28.0, 28.3, 27.8, 27.5, 27.7, 27.6, 27.1, 27.2, 26.8, 27.1,
    27.1, 27.4, 27.3, 27.7, 27.1, 27.7, 27.9, 27.4, 27.4, 27.6,
  ],
  gdp_ppp_percapita: [
    31195.12, 32047.71, 34440.38, 37842.92, 40081.22, 37988.45, 38946.23,
    40845.96, 40739.11, 41325.81, 41547.1, 42257.86, 44562.4, 47234.85,
    49248.68, 52276.11, 53296.58, 56790.38, 62133.14, 63466.84, 65137.2,
    65884.5,
  ],
  gov_debt_pct_gdp: [
    42.58, 39.87, 38.01, 33.91, 32.56, 41.53, 50.11, 52.02, 57.86, 60.81, 64.81,
    68.76, 68.65, 66.58, 65.28, 65.33, 75.32, 73.13, 73.96, 77.04, 82.15, 86.78,
  ],
  population: [
    5228172, 5246096, 5266268, 5288720, 5313399, 5338871, 5363352, 5388272,
    5413971, 5438972, 5461512, 5479531, 5495303, 5508214, 5515525, 5521606,
    5529543, 5541017, 5556106, 5583911, 5619911, 5646436,
  ],
  gii_score: [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    59.5,
    60.7,
    60.0,
    59.9,
    58.5,
    59.6,
    59.8,
    57.0,
    58.4,
    56.9,
    61.2,
    59.4,
    57.7,
  ],
};

const leadTrio: Partial<Record<MetricKey, Prov>> = {
  patents_residents: "extrapolated_lead",
  patents_nonresidents: "extrapolated_lead",
  hitech_exports_usd: "extrapolated_lead",
  hitech_pct_manufactured: "extrapolated_lead",
};

const italyProv: ProvMap = {
  2004: leadTrio,
  2005: leadTrio,
  2006: leadTrio,
  2015: {
    patents_residents: "interpolated",
    patents_nonresidents: "interpolated",
  },
  2024: {
    journal_articles: "extrapolated_trail",
    rd_pct_gdp: "extrapolated_trail",
    gini_index: "extrapolated_trail",
  },
  2025: {
    patents_residents: "extrapolated_trail",
    patents_nonresidents: "extrapolated_trail",
    journal_articles: "extrapolated_trail",
    rd_pct_gdp: "extrapolated_trail",
    hitech_exports_usd: "extrapolated_trail",
    hitech_pct_manufactured: "extrapolated_trail",
    gini_index: "extrapolated_trail",
  },
};

const fiLead: Partial<Record<MetricKey, Prov>> = {
  hitech_exports_usd: "extrapolated_lead",
  hitech_pct_manufactured: "extrapolated_lead",
};

const finlandProv: ProvMap = {
  2004: fiLead,
  2005: fiLead,
  2006: fiLead,
  2024: {
    journal_articles: "extrapolated_trail",
    rd_pct_gdp: "interpolated",
  },
  2025: {
    patents_residents: "extrapolated_trail",
    patents_nonresidents: "extrapolated_trail",
    journal_articles: "extrapolated_trail",
  },
};

function build(cols: Columns, prov: ProvMap): Record<MetricKey, YearPoint[]> {
  const out = {} as Record<MetricKey, YearPoint[]>;
  (Object.keys(cols) as MetricKey[]).forEach((key) => {
    out[key] = cols[key].map((v, i) => {
      const year = FIRST_YEAR + i;
      return {
        year,
        value: v,
        prov: v === null ? "missing" : (prov[year]?.[key] ?? "real"),
      };
    });
  });
  return out;
}

export const DATA: Record<Country, Record<MetricKey, YearPoint[]>> = {
  Italy: build(italyCols, italyProv),
  Finland: build(finlandCols, finlandProv),
};

export const METRIC_KEYS = Object.keys(italyCols) as MetricKey[];

export function populationAt(country: Country, year: number): number {
  return DATA[country].population[year - FIRST_YEAR].value ?? 1;
}

export function firstReal(points: YearPoint[]): YearPoint | null {
  return points.find((p) => p.value !== null) ?? null;
}

export function lastReal(points: YearPoint[]): YearPoint | null {
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].value !== null) return points[i];
  }
  return null;
}

export function periodChangePct(points: YearPoint[]): number | null {
  const a = firstReal(points);
  const b = lastReal(points);
  if (!a || !b || a.value === null || b.value === null || a.value === 0)
    return null;
  return (b.value / a.value - 1) * 100;
}

/** Trailing 3-year mean over available values; provenance preserved. */
export function roll3(points: YearPoint[]): YearPoint[] {
  return points.map((p, i) => {
    const window = points
      .slice(Math.max(0, i - 2), i + 1)
      .filter((q) => q.value !== null)
      .map((q) => q.value as number);
    if (window.length === 0) return { ...p, value: null };
    const mean = window.reduce((s, v) => s + v, 0) / window.length;
    return { ...p, value: mean };
  });
}

export function provenanceCounts(): Record<Prov, number> {
  const counts: Record<Prov, number> = {
    real: 0,
    interpolated: 0,
    extrapolated_lead: 0,
    extrapolated_trail: 0,
    missing: 0,
  };
  for (const c of COUNTRIES) {
    for (const k of METRIC_KEYS) {
      for (const p of DATA[c][k]) counts[p.prov] += 1;
    }
  }
  return counts;
}
