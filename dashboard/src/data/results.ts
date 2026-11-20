/**
 * Bundled verbatim (display-rounded) from data/processed/
 * vif_results.json, dlm_results.json, gii_analysis.json — generated 2026-11-19.
 */
import type { Country } from "./series";

export interface VifEntry {
  feature: string;
  VIF: number;
}
export interface RemovalStep {
  iteration: number;
  dropped: string;
  vif: number;
  remaining: number;
}
export interface FitStats {
  r_squared: number;
  adj_r_squared: number;
  aic: number;
  bic?: number;
  f_stat?: number;
  f_pvalue?: number;
  dw: number;
  omnibus_p: number;
}
export interface CoefRow {
  feature: string;
  coef: number;
  se_std: number;
  p_std: number;
  se_hc3: number;
  p_hc3: number;
  sig5_std: boolean;
  sig5_hc3: boolean;
}
export interface VifModel {
  status: string;
  target: string;
  n_obs: number;
  final_features: string[];
  removal_history: RemovalStep[];
  vif_initial: VifEntry[];
  vif_final: VifEntry[];
  fit: FitStats;
  coefficients: CoefRow[];
}

const IT_LEVELS: VifModel = {
  status: "ok",
  target: "hitech_exports_usd",
  n_obs: 22,
  final_features: [
    "gdp_ppp_percapita",
    "patents_total",
    "gov_debt_pct_gdp",
    "gini_index",
  ],
  removal_history: [
    { iteration: 1, dropped: "journal_articles", vif: 61.668, remaining: 5 },
    { iteration: 2, dropped: "rd_pct_gdp", vif: 14.161, remaining: 4 },
  ],
  vif_initial: [
    { feature: "journal_articles", VIF: 61.668 },
    { feature: "gov_debt_pct_gdp", VIF: 34.57 },
    { feature: "gdp_ppp_percapita", VIF: 16.028 },
    { feature: "rd_pct_gdp", VIF: 14.347 },
    { feature: "gini_index", VIF: 2.864 },
    { feature: "patents_total", VIF: 1.53 },
  ],
  vif_final: [
    { feature: "gov_debt_pct_gdp", VIF: 4.05 },
    { feature: "gdp_ppp_percapita", VIF: 2.611 },
    { feature: "gini_index", VIF: 2.357 },
    { feature: "patents_total", VIF: 1.052 },
  ],
  fit: {
    r_squared: 0.9182,
    adj_r_squared: 0.899,
    aic: 1031.385,
    bic: 1036.84,
    f_stat: 47.737,
    f_pvalue: 5.02e-9,
    dw: 0.939,
    omnibus_p: 0.858,
  },
  coefficients: [
    {
      feature: "const",
      coef: -35667371357.42,
      se_std: 49174909439.55,
      p_std: 0.4781,
      se_hc3: 58474243848.16,
      p_hc3: 0.5419,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "gdp_ppp_percapita",
      coef: 1143613.75,
      se_std: 113104.59,
      p_std: 1.32e-8,
      se_hc3: 168942.17,
      p_hc3: 1.29e-11,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "patents_total",
      coef: -258777.25,
      se_std: 925953.86,
      p_std: 0.7833,
      se_hc3: 893985.78,
      p_hc3: 0.7722,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "gov_debt_pct_gdp",
      coef: -214376133.81,
      se_std: 100813155.84,
      p_std: 0.0484,
      se_hc3: 119331519.95,
      p_hc3: 0.0724,
      sig5_std: true,
      sig5_hc3: false,
    },
    {
      feature: "gini_index",
      coef: 1504631478.13,
      se_std: 1546104335.25,
      p_std: 0.3441,
      se_hc3: 1823898599.49,
      p_hc3: 0.4094,
      sig5_std: false,
      sig5_hc3: false,
    },
  ],
};

const IT_LOG: VifModel = {
  status: "ok",
  target: "log_hitech_exports_usd",
  n_obs: 22,
  final_features: [
    "gdp_ppp_percapita",
    "patents_total",
    "gov_debt_pct_gdp",
    "gini_index",
  ],
  removal_history: IT_LEVELS.removal_history,
  vif_initial: IT_LEVELS.vif_initial,
  vif_final: IT_LEVELS.vif_final,
  fit: {
    r_squared: 0.933,
    adj_r_squared: 0.9173,
    aic: -47.035,
    bic: -41.58,
    f_stat: 59.213,
    f_pvalue: 9.35e-10,
    dw: 1.176,
    omnibus_p: 0.7926,
  },
  coefficients: [
    {
      feature: "const",
      coef: 22.6663,
      se_std: 1.1153,
      p_std: 2.3e-13,
      se_hc3: 1.4108,
      p_hc3: 4.38e-58,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "gdp_ppp_percapita",
      coef: 2.7076e-5,
      se_std: 2.5652e-6,
      p_std: 6.97e-9,
      se_hc3: 3.5345e-6,
      p_hc3: 1.85e-14,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "patents_total",
      coef: -2.7239e-5,
      se_std: 2.1001e-5,
      p_std: 0.2119,
      se_hc3: 1.9579e-5,
      p_hc3: 0.1642,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "gov_debt_pct_gdp",
      coef: -0.003355,
      se_std: 0.002286,
      p_std: 0.1606,
      se_hc3: 0.002723,
      p_hc3: 0.218,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "gini_index",
      coef: 0.03262,
      se_std: 0.035065,
      p_std: 0.3652,
      se_hc3: 0.04446,
      p_hc3: 0.4631,
      sig5_std: false,
      sig5_hc3: false,
    },
  ],
};

const FI_LEVELS: VifModel = {
  status: "ok",
  target: "hitech_exports_usd",
  n_obs: 22,
  final_features: [
    "rd_pct_gdp",
    "gdp_ppp_percapita",
    "patents_total",
    "gini_index",
  ],
  removal_history: [
    { iteration: 1, dropped: "journal_articles", vif: 22.627, remaining: 5 },
    { iteration: 2, dropped: "gov_debt_pct_gdp", vif: 13.445, remaining: 4 },
  ],
  vif_initial: [
    { feature: "journal_articles", VIF: 22.627 },
    { feature: "gov_debt_pct_gdp", VIF: 13.976 },
    { feature: "gdp_ppp_percapita", VIF: 12.195 },
    { feature: "patents_total", VIF: 11.451 },
    { feature: "gini_index", VIF: 3.584 },
    { feature: "rd_pct_gdp", VIF: 3.088 },
  ],
  vif_final: [
    { feature: "patents_total", VIF: 2.617 },
    { feature: "rd_pct_gdp", VIF: 2.279 },
    { feature: "gini_index", VIF: 1.385 },
    { feature: "gdp_ppp_percapita", VIF: 1.313 },
  ],
  fit: {
    r_squared: 0.8176,
    adj_r_squared: 0.7747,
    aic: 1009.822,
    bic: 1015.277,
    f_stat: 19.048,
    f_pvalue: 4.16e-6,
    dw: 1.709,
    omnibus_p: 0.000427,
  },
  coefficients: [
    {
      feature: "const",
      coef: -137421443236.03,
      se_std: 38268845134.46,
      p_std: 0.00225,
      se_hc3: 34535699752.15,
      p_hc3: 6.92e-5,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "rd_pct_gdp",
      coef: -1941623999.58,
      se_std: 2198598144.11,
      p_std: 0.3895,
      se_hc3: 2999160509.46,
      p_hc3: 0.5174,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "gdp_ppp_percapita",
      coef: -168032.29,
      se_std: 47369.97,
      p_std: 0.00248,
      se_hc3: 38870.59,
      p_hc3: 1.54e-5,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "patents_total",
      coef: 7956842.15,
      se_std: 2969475.58,
      p_std: 0.0158,
      se_hc3: 3634253.28,
      p_hc3: 0.0286,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "gini_index",
      coef: 5268960088.28,
      se_std: 1446564827.51,
      p_std: 0.00201,
      se_hc3: 1211303589.42,
      p_hc3: 1.36e-5,
      sig5_std: true,
      sig5_hc3: true,
    },
  ],
};

const FI_LOG: VifModel = {
  status: "ok",
  target: "log_hitech_exports_usd",
  n_obs: 22,
  final_features: [
    "rd_pct_gdp",
    "gdp_ppp_percapita",
    "patents_total",
    "gini_index",
  ],
  removal_history: FI_LEVELS.removal_history,
  vif_initial: FI_LEVELS.vif_initial,
  vif_final: FI_LEVELS.vif_final,
  fit: {
    r_squared: 0.8705,
    adj_r_squared: 0.8401,
    aic: -5.4,
    bic: 0.055,
    f_stat: 28.578,
    f_pvalue: 2.38e-7,
    dw: 1.79,
    omnibus_p: 0.0203,
  },
  coefficients: [
    {
      feature: "const",
      coef: 5.9341,
      se_std: 3.6498,
      p_std: 0.1224,
      se_hc3: 3.6599,
      p_hc3: 0.1049,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "rd_pct_gdp",
      coef: -0.03715,
      se_std: 0.20969,
      p_std: 0.8615,
      se_hc3: 0.27461,
      p_hc3: 0.8924,
      sig5_std: false,
      sig5_hc3: false,
    },
    {
      feature: "gdp_ppp_percapita",
      coef: -1.7467e-5,
      se_std: 4.5178e-6,
      p_std: 0.00124,
      se_hc3: 4.2316e-6,
      p_hc3: 3.66e-5,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "patents_total",
      coef: 0.0008689,
      se_std: 0.0002832,
      p_std: 0.00696,
      se_hc3: 0.0003437,
      p_hc3: 0.01146,
      sig5_std: true,
      sig5_hc3: true,
    },
    {
      feature: "gini_index",
      coef: 0.58455,
      se_std: 0.13796,
      p_std: 0.000556,
      se_hc3: 0.13045,
      p_hc3: 7.43e-6,
      sig5_std: true,
      sig5_hc3: true,
    },
  ],
};

export const VIF_RESULTS: Record<Country, { levels: VifModel; log: VifModel }> =
  {
    Italy: { levels: IT_LEVELS, log: IT_LOG },
    Finland: { levels: FI_LEVELS, log: FI_LOG },
  };

export const VIF_METADATA = {
  vif_threshold: 5.0,
  candidate_pool: [
    "rd_pct_gdp",
    "gdp_ppp_percapita",
    "patents_total",
    "journal_articles",
    "gov_debt_pct_gdp",
    "gini_index",
  ],
  note: "log_hitech_exports_usd is the primary specification; levels shown as robustness.",
};

/* ————— Distributed lag model ————— */

export interface LagRow {
  lag: number;
  coef: number;
  p_std: number;
  p_hc3: number;
  sig5_std: boolean;
  sig5_hc3: boolean;
  sig10_hc3: boolean;
}
export interface DlmModel {
  status: string;
  n_obs: number;
  n_lags: number;
  fit: FitStats;
  lag_table: LagRow[];
  most_significant_lag: { lag: number; coef: number; p_hc3: number };
  lag_vifs: VifEntry[];
  robustness: { model: string; coef: number; p_hc3: number };
}

export const DLM_METADATA = {
  model: "hitech_exports_usd ~ Σ rd_pct_gdp_{t-L} + gdp_ppp_percapita",
  n_lags: 5,
  control: "gdp_ppp_percapita",
  warning:
    "All series I(1); levels DLM has spurious-regression risk. ARDL/VECM required for causal claim.",
};

export const DLM_RESULTS: Record<Country, DlmModel> = {
  Italy: {
    status: "ok",
    n_obs: 17,
    n_lags: 5,
    fit: {
      r_squared: 0.9815,
      adj_r_squared: 0.9671,
      aic: 780.593,
      dw: 1.98,
      omnibus_p: 0.3123,
    },
    lag_table: [
      {
        lag: 0,
        coef: -66632325480.08,
        p_std: 0.01056,
        p_hc3: 0.05627,
        sig5_std: true,
        sig5_hc3: false,
        sig10_hc3: true,
      },
      {
        lag: 1,
        coef: -333076192.88,
        p_std: 0.98776,
        p_hc3: 0.99149,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 2,
        coef: -9099270846.58,
        p_std: 0.67613,
        p_hc3: 0.7918,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 3,
        coef: -52317041488.57,
        p_std: 0.03484,
        p_hc3: 0.10891,
        sig5_std: true,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 4,
        coef: 60094261055.99,
        p_std: 0.02306,
        p_hc3: 0.05734,
        sig5_std: true,
        sig5_hc3: false,
        sig10_hc3: true,
      },
      {
        lag: 5,
        coef: 50411012464.18,
        p_std: 0.05416,
        p_hc3: 0.13593,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
    ],
    most_significant_lag: { lag: 0, coef: -66632325480.08, p_hc3: 0.05627 },
    lag_vifs: [
      { feature: "rd_lag0", VIF: 24.835 },
      { feature: "rd_lag1", VIF: 13.911 },
      { feature: "rd_lag2", VIF: 17.872 },
      { feature: "rd_lag3", VIF: 21.929 },
      { feature: "rd_lag4", VIF: 27.409 },
      { feature: "rd_lag5", VIF: 36.912 },
    ],
    robustness: {
      model: "rd_lag0 + gdp_ppp_percapita",
      coef: -32843279856.48,
      p_hc3: 0.001957,
    },
  },
  Finland: {
    status: "ok",
    n_obs: 17,
    n_lags: 5,
    fit: {
      r_squared: 0.9072,
      adj_r_squared: 0.8349,
      aic: 733.21,
      dw: 1.585,
      omnibus_p: 0.8809,
    },
    lag_table: [
      {
        lag: 0,
        coef: 4733532219.99,
        p_std: 0.01948,
        p_hc3: 0.15392,
        sig5_std: true,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 1,
        coef: 583411293.98,
        p_std: 0.84324,
        p_hc3: 0.89839,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 2,
        coef: -3774260785.74,
        p_std: 0.21294,
        p_hc3: 0.39383,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 3,
        coef: 1563711296.88,
        p_std: 0.59463,
        p_hc3: 0.67706,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 4,
        coef: -1440474496.72,
        p_std: 0.6238,
        p_hc3: 0.72048,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
      {
        lag: 5,
        coef: 893847606.5,
        p_std: 0.66861,
        p_hc3: 0.75087,
        sig5_std: false,
        sig5_hc3: false,
        sig10_hc3: false,
      },
    ],
    most_significant_lag: { lag: 0, coef: 4733532219.99, p_hc3: 0.15392 },
    lag_vifs: [
      { feature: "rd_lag0", VIF: 7.348 },
      { feature: "rd_lag1", VIF: 20.355 },
      { feature: "rd_lag2", VIF: 65.518 },
      { feature: "rd_lag3", VIF: 64.307 },
      { feature: "rd_lag4", VIF: 65.879 },
      { feature: "rd_lag5", VIF: 65.138 },
    ],
    robustness: {
      model: "rd_lag0 + gdp_ppp_percapita",
      coef: 3152763813.26,
      p_hc3: 3.5e-5,
    },
  },
};

/* ————— GII drivers ————— */

export interface GiiModel {
  status: string;
  n_obs: number;
  final_features: string[];
  surviving_rd_lag: string;
  removal_history: RemovalStep[];
  vif_initial: VifEntry[];
  vif_final: VifEntry[];
  fit: FitStats;
  coefficients: CoefRow[];
}
export interface LagSensitivity {
  status: string;
  n_obs: number;
  r_squared: number;
  adj_r_squared: number;
  aic: number;
  bic: number;
  rd_coef: number;
  rd_p_hc3: number;
}

export const GII_METADATA = {
  target: "gii_score",
  target_label: "Global Innovation Index (score, 0–100)",
  candidate_pool: [
    "rd_pct_gdp",
    "rd_pct_gdp_lag1",
    "rd_pct_gdp_lag2",
    "log_gdp_ppp_percapita",
    "gov_debt_pct_gdp",
    "gini_index",
    "hitech_pct_manufactured",
  ],
  vif_threshold: 5.0,
  excluded_tautological: [
    "patents_total",
    "journal_articles",
    "hitech_exports_usd",
  ],
  notes: [
    "GII is published only from 2011 (Italy) and 2013 (Finland) onward.",
    "Italy 2024–2025 rd_pct_gdp is linearly extrapolated; Finland 2024 is interior-interpolated.",
    "hitech_pct_manufactured is partially tautological with GII (knowledge pillar); flagged if retained.",
    "Small sample: N=15 (Italy), N=13 (Finland). Descriptive, not causal.",
    "RD-lag sensitivity check compares lag0 / lag1 / lag2 in isolation; the VIF-selected lag may differ.",
  ],
};

export const GII_RESULTS: Record<Country, GiiModel> = {
  Italy: {
    status: "ok",
    n_obs: 15,
    final_features: [
      "rd_pct_gdp",
      "rd_pct_gdp_lag2",
      "gov_debt_pct_gdp",
      "gini_index",
      "hitech_pct_manufactured",
    ],
    surviving_rd_lag: "rd_pct_gdp",
    removal_history: [
      {
        iteration: 1,
        dropped: "log_gdp_ppp_percapita",
        vif: 29.784,
        remaining: 6,
      },
      { iteration: 2, dropped: "rd_pct_gdp_lag1", vif: 13.722, remaining: 5 },
    ],
    vif_initial: [
      { feature: "log_gdp_ppp_percapita", VIF: 29.784 },
      { feature: "rd_pct_gdp_lag2", VIF: 15.141 },
      { feature: "rd_pct_gdp_lag1", VIF: 14.411 },
      { feature: "hitech_pct_manufactured", VIF: 9.77 },
      { feature: "gov_debt_pct_gdp", VIF: 6.858 },
      { feature: "rd_pct_gdp", VIF: 6.298 },
      { feature: "gini_index", VIF: 2.591 },
    ],
    vif_final: [
      { feature: "rd_pct_gdp", VIF: 4.087 },
      { feature: "gov_debt_pct_gdp", VIF: 3.532 },
      { feature: "rd_pct_gdp_lag2", VIF: 3.478 },
      { feature: "gini_index", VIF: 2.033 },
      { feature: "hitech_pct_manufactured", VIF: 1.605 },
    ],
    fit: {
      r_squared: 0.3037,
      adj_r_squared: -0.0831,
      aic: 63.077,
      bic: 67.325,
      f_stat: 0.785,
      f_pvalue: 0.5854,
      dw: 1.207,
      omnibus_p: 0.4664,
    },
    coefficients: [
      {
        feature: "const",
        coef: 41.0548,
        se_std: 44.7359,
        p_std: 0.3827,
        se_hc3: 68.2804,
        p_hc3: 0.5477,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "rd_pct_gdp",
        coef: 13.0251,
        se_std: 12.1137,
        p_std: 0.3102,
        se_hc3: 18.1753,
        p_hc3: 0.4736,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "rd_pct_gdp_lag2",
        coef: -4.4027,
        se_std: 9.4025,
        p_std: 0.6507,
        se_hc3: 15.7028,
        p_hc3: 0.7792,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "gov_debt_pct_gdp",
        coef: 0.02647,
        se_std: 0.10989,
        p_std: 0.8151,
        se_hc3: 0.19999,
        p_hc3: 0.8947,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "gini_index",
        coef: -0.25226,
        se_std: 1.18186,
        p_std: 0.8357,
        se_hc3: 1.75512,
        p_hc3: 0.8857,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "hitech_pct_manufactured",
        coef: -0.22505,
        se_std: 0.36134,
        p_std: 0.5489,
        se_hc3: 0.33122,
        p_hc3: 0.4969,
        sig5_std: false,
        sig5_hc3: false,
      },
    ],
  },
  Finland: {
    status: "ok",
    n_obs: 13,
    final_features: [
      "rd_pct_gdp",
      "rd_pct_gdp_lag2",
      "gov_debt_pct_gdp",
      "gini_index",
      "hitech_pct_manufactured",
    ],
    surviving_rd_lag: "rd_pct_gdp",
    removal_history: [
      { iteration: 1, dropped: "rd_pct_gdp_lag1", vif: 26.61, remaining: 6 },
      {
        iteration: 2,
        dropped: "log_gdp_ppp_percapita",
        vif: 23.473,
        remaining: 5,
      },
    ],
    vif_initial: [
      { feature: "rd_pct_gdp_lag1", VIF: 26.61 },
      { feature: "log_gdp_ppp_percapita", VIF: 26.247 },
      { feature: "rd_pct_gdp_lag2", VIF: 15.325 },
      { feature: "rd_pct_gdp", VIF: 12.201 },
      { feature: "gov_debt_pct_gdp", VIF: 10.19 },
      { feature: "gini_index", VIF: 4.544 },
      { feature: "hitech_pct_manufactured", VIF: 1.358 },
    ],
    vif_final: [
      { feature: "rd_pct_gdp_lag2", VIF: 3.283 },
      { feature: "rd_pct_gdp", VIF: 2.854 },
      { feature: "gov_debt_pct_gdp", VIF: 1.883 },
      { feature: "gini_index", VIF: 1.775 },
      { feature: "hitech_pct_manufactured", VIF: 1.224 },
    ],
    fit: {
      r_squared: 0.2954,
      adj_r_squared: -0.2079,
      aic: 50.859,
      bic: 54.249,
      f_stat: 0.587,
      f_pvalue: 0.7116,
      dw: 2.557,
      omnibus_p: 0.5933,
    },
    coefficients: [
      {
        feature: "const",
        coef: 103.2181,
        se_std: 55.8464,
        p_std: 0.107,
        se_hc3: 84.6624,
        p_hc3: 0.2228,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "rd_pct_gdp",
        coef: -0.05987,
        se_std: 3.9339,
        p_std: 0.9883,
        se_hc3: 3.9636,
        p_hc3: 0.9879,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "rd_pct_gdp_lag2",
        coef: 0.72726,
        se_std: 2.8293,
        p_std: 0.8045,
        se_hc3: 4.2711,
        p_hc3: 0.8648,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "gov_debt_pct_gdp",
        coef: -0.03654,
        se_std: 0.07755,
        p_std: 0.6518,
        se_hc3: 0.09107,
        p_hc3: 0.6883,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "gini_index",
        coef: -1.50111,
        se_std: 1.84176,
        p_std: 0.4419,
        se_hc3: 3.04889,
        p_hc3: 0.6225,
        sig5_std: false,
        sig5_hc3: false,
      },
      {
        feature: "hitech_pct_manufactured",
        coef: -0.25337,
        se_std: 1.03746,
        p_std: 0.8141,
        se_hc3: 0.93648,
        p_hc3: 0.7867,
        sig5_std: false,
        sig5_hc3: false,
      },
    ],
  },
};

export const GII_LAG_SENSITIVITY: Record<
  Country,
  Record<"rd_pct_gdp" | "rd_pct_gdp_lag1" | "rd_pct_gdp_lag2", LagSensitivity>
> = {
  Italy: {
    rd_pct_gdp: {
      status: "ok",
      n_obs: 15,
      r_squared: 0.2874,
      adj_r_squared: -0.1085,
      aic: 63.424,
      bic: 67.672,
      rd_coef: 11.3936,
      rd_p_hc3: 0.4955,
    },
    rd_pct_gdp_lag1: {
      status: "ok",
      n_obs: 15,
      r_squared: 0.2494,
      adj_r_squared: -0.1675,
      aic: 64.202,
      bic: 68.451,
      rd_coef: -8.801,
      rd_p_hc3: 0.7098,
    },
    rd_pct_gdp_lag2: {
      status: "ok",
      n_obs: 15,
      r_squared: 0.2948,
      adj_r_squared: -0.097,
      aic: 63.267,
      bic: 67.515,
      rd_coef: -16.2867,
      rd_p_hc3: 0.6164,
    },
  },
  Finland: {
    rd_pct_gdp: {
      status: "ok",
      n_obs: 13,
      r_squared: 0.3607,
      adj_r_squared: -0.0959,
      aic: 49.594,
      bic: 52.983,
      rd_coef: 0.6702,
      rd_p_hc3: 0.8027,
    },
    rd_pct_gdp_lag1: {
      status: "ok",
      n_obs: 13,
      r_squared: 0.3918,
      adj_r_squared: -0.0426,
      aic: 48.946,
      bic: 52.336,
      rd_coef: 1.4041,
      rd_p_hc3: 0.6365,
    },
    rd_pct_gdp_lag2: {
      status: "ok",
      n_obs: 13,
      r_squared: 0.4306,
      adj_r_squared: 0.0239,
      aic: 48.089,
      bic: 51.478,
      rd_coef: 1.865,
      rd_p_hc3: 0.617,
    },
  },
};
