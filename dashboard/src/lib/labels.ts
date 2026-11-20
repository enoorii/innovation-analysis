export const FEATURE_LABELS: Record<string, string> = {
  const: "Intercept",
  rd_pct_gdp: "R&D intensity (% GDP)",
  rd_pct_gdp_lag1: "R&D intensity (t−1)",
  rd_pct_gdp_lag2: "R&D intensity (t−2)",
  gdp_ppp_percapita: "GDP per capita (PPP $)",
  log_gdp_ppp_percapita: "log GDP per capita",
  patents_total: "Total patents",
  journal_articles: "Journal articles",
  gov_debt_pct_gdp: "Gov. debt (% GDP)",
  gini_index: "Gini index",
  hitech_pct_manufactured: "Hi-tech share of mfg. exports",
  rd_lag0: "R&D (t)",
  rd_lag1: "R&D (t−1)",
  rd_lag2: "R&D (t−2)",
  rd_lag3: "R&D (t−3)",
  rd_lag4: "R&D (t−4)",
  rd_lag5: "R&D (t−5)",
};

export function prettyFeature(key: string): string {
  return FEATURE_LABELS[key] ?? key;
}

/** Sensible reporting unit per predictor (avoids "per +$1" absurdity). */
const EFFECT_UNIT: Record<string, { mult: number; per: string }> = {
  gdp_ppp_percapita: { mult: 1000, per: "per +$1,000 GDP pc" },
  log_gdp_ppp_percapita: { mult: 0.1, per: "per +0.1 log GDP pc" },
  patents_total: { mult: 100, per: "per +100 patents" },
  journal_articles: { mult: 1000, per: "per +1,000 articles" },
  rd_pct_gdp: { mult: 0.1, per: "per +0.1pp R&D" },
  rd_pct_gdp_lag1: { mult: 0.1, per: "per +0.1pp R&D (t−1)" },
  rd_pct_gdp_lag2: { mult: 0.1, per: "per +0.1pp R&D (t−2)" },
  gini_index: { mult: 1, per: "per +1 Gini pt" },
  gov_debt_pct_gdp: { mult: 10, per: "per +10pp debt" },
  hitech_pct_manufactured: { mult: 1, per: "per +1pp hi-tech share" },
};

export type EffectTarget = "log-exports" | "level-exports" | "gii";

/** Human-readable conditional association, or null when not meaningful. */
export function effectLabel(
  feature: string,
  coef: number,
  target: EffectTarget,
): string | null {
  const unit = EFFECT_UNIT[feature];
  if (!unit || feature === "const") return null;
  const raw = coef * unit.mult;
  if (target === "log-exports") {
    const pct = raw * 100;
    return `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(2)}% exports ${unit.per}`;
  }
  if (target === "level-exports") {
    const b = raw / 1e9;
    return `${b >= 0 ? "+" : "−"}$${Math.abs(b).toFixed(2)}B exports ${unit.per}`;
  }
  return `${raw >= 0 ? "+" : "−"}${Math.abs(raw).toFixed(2)} GII pts ${unit.per}`;
}
