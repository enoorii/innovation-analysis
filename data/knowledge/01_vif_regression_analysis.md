# Analysis 1 — Iterative VIF Regression: Drivers of Hi-Tech Exports

## Purpose of this analysis

This analysis tests which economic and innovation-related factors are associated with **hi-tech exports** (`hitech_exports_usd`) for Italy and Finland, using a backward Variance Inflation Factor (VIF) selection procedure followed by Ordinary Least Squares (OLS) regression with heteroskedasticity-robust (HC3) standard errors.

The analysis was conducted **separately for each country** — no pooling — because the two economies differ substantially in scale (Italy ≈ 59M population, Finland ≈ 5.6M) and in their innovation systems (Italy: manufacturing-driven with moderate R&D intensity ≈ 1.4% of GDP; Finland: R&D-intensive ≈ 3.0% of GDP with strong tech sector).

**Sample size:** 22 annual observations per country (2004–2025). This is a small sample; all findings should be interpreted as descriptive associations, not causal claims.

**Unit of analysis:** country-year.

---

## Methodology

### Step 1 — Target variable

The dependent variable is `hitech_exports_usd`, the monetary value of high-technology exports in current US dollars, sourced from the World Bank (`TX.VAL.TECH.CD`).

**The log-transformed target `log_hitech_exports_usd = log(1 + hitech_exports_usd)` is the primary specification**, because the untransformed series spans nearly two orders of magnitude across the sample period (Italy $27.8B → $60.2B; Finland $8.7B → $17.0B with a GFC crash). In a log-level regression, coefficients are interpretable as approximate percentage effects: a one-unit change in predictor X is associated with a (100 × β) % change in hi-tech exports.

The untransformed-target specification was run as a robustness check; findings from the log specification are reported as primary.

### Step 2 — Candidate predictors (6 variables)

The following six predictors enter the full model:

| Predictor           | Interpretation                                                | World Bank source             |
| ------------------- | ------------------------------------------------------------- | ----------------------------- |
| `rd_pct_gdp`        | R&D expenditure as % of GDP (innovation input intensity)      | `GB.XPD.RSDV.GD.ZS`           |
| `gdp_ppp_percapita` | GDP per capita, PPP-adjusted USD (development level)          | `NY.GDP.PCAP.PP.CD`           |
| `patents_total`     | Total patents filed (residents + non-residents)               | `IP.PAT.RESD` + `IP.PAT.NRES` |
| `journal_articles`  | Scientific and technical journal article count                | `IP.JRN.ARTC.SC`              |
| `gov_debt_pct_gdp`  | General government gross debt as % of GDP (fiscal constraint) | derived                       |
| `gini_index`        | Gini coefficient (income inequality, 0–100 scale)             | `SI.POV.GINI`                 |

### Step 3 — Why four features were excluded from the candidate pool

An **earlier run used a 10-predictor pool** that produced unreliable results due to three structural problems. The revised pool fixes those problems. If users ask why certain variables were excluded, the reasons are:

**`hitech_pct_manufactured` — excluded as tautological.**
This variable is defined as `(hi-tech exports ÷ total manufactured exports) × 100`. Its numerator is `hitech_exports_usd` — the target. Regressing exports on this ratio is a mathematical identity, not an empirical finding. In the earlier run it produced a spuriously "significant" coefficient and inflated Italy's R² to 0.92. It must never be used as a predictor of hi-tech exports.

**`patents_per_million` — excluded as algebraically derived.**
Defined as `patents_total ÷ (population / 1,000,000)`. Its VIF against `patents_total` in the earlier run exceeded 20,000. Keeping both would cause arbitrary drop selection (whichever has numerically larger VIF by coincidence).

**`rd_per_capita_ppp` — excluded as algebraically derived.**
Defined as `rd_pct_gdp × gdp_ppp_percapita`. Its VIF exceeded 15,000 in the earlier run. Worse, in Finland's prior final model it produced a **negative** significant coefficient purely as an artifact of "conditional on R&D intensity, higher GDP per capita goes with lower exports" — a mathematical consequence, not an economic finding.

**`population` — excluded as weak-prior and collinear.**
Population is nearly flat within each country across 2004–2025, so it carries almost no information for explaining export movements. Its correlation with `patents_total` and `gdp_ppp_percapita` makes it collinear without adding signal.

**Other columns not in the pool** (log-transformed features, growth rates, lags, rolling means, GII-derived indicators) are reserved for other analyses (see Analysis 2 for the distributed-lag model).

### Step 4 — VIF elimination procedure

The algorithm is:

1. Fit OLS of the target on all candidate predictors.
2. Compute VIF for each predictor using `variance_inflation_factor`.
3. If the highest VIF ≤ 5.0, stop — the current subset is final.
4. Otherwise, **remove the single predictor with the highest VIF**, refit, and recompute VIFs.
5. Repeat from step 2.

The procedure removes exactly one variable per iteration and uses a VIF threshold of 5.0 (values at exactly 5.0 are accepted).

**Missing data policy:** listwise deletion. In the log-target specification no rows were lost because all candidate predictors are complete after the interpolation step documented in `00_data_preparation.md`.

### Step 5 — Final model inference

The final model is fit twice:

- Once with ordinary standard errors (`sm.OLS` default) for comparison.
- Once with **HC3 heteroskedasticity-robust standard errors**, which are authoritative because (a) both countries' residuals show evidence of variance changes over the sample period, and (b) Finland's residuals fail normality tests under OLS.

### Step 6 — Residual diagnostics

For each final model, the following diagnostics are reported in the OLS summary:

- **Omnibus / Jarque-Bera** — normality of residuals (p > 0.05 is desirable)
- **Durbin-Watson** — autocorrelation (ideal ≈ 2.0; < 1.5 suggests positive autocorrelation)
- **Condition number** — a large value (> 1e5) indicates the X matrix is poorly scaled. In this analysis, condition numbers of ~3 × 10⁶ reflect the extreme unit differences between predictors (GDP per capita in thousands vs. patent counts in ones), not problematic collinearity per se — VIFs are already all ≤ 5 in the final models.

---

## Results — Italy

### Elimination sequence

Two predictors were removed due to high VIF:

| Iteration | Predictor dropped  | VIF at removal | Remaining predictors |
| --------- | ------------------ | -------------- | -------------------- |
| 1         | `journal_articles` | 61.67          | 5                    |
| 2         | `rd_pct_gdp`       | 14.16          | 4                    |

After iteration 3, all remaining VIFs were ≤ 5 (max = 4.05 for `gov_debt_pct_gdp`).

### Final model — Italy

**Predictors retained:** `gdp_ppp_percapita`, `patents_total`, `gov_debt_pct_gdp`, `gini_index`

**Fit statistics:**

- N = 22 observations
- R² = 0.933
- Adjusted R² = 0.917
- F-statistic = 53.20 (p ≈ 2.2 × 10⁻⁹, HC3)
- AIC = −47.04
- Durbin-Watson = 1.176
- Omnibus p = 0.793 (residuals consistent with normal)

### Coefficients — Italy (HC3 robust SEs are authoritative)

| Predictor           | Coefficient   | HC3 SE      | HC3 p-value | Significant at 5%? |
| ------------------- | ------------- | ----------- | ----------- | ------------------ |
| const               | 22.666        | 1.411       | < 0.001     | ✅                 |
| `gdp_ppp_percapita` | 2.708 × 10⁻⁵  | 3.53 × 10⁻⁶ | < 0.001     | ✅                 |
| `patents_total`     | −2.724 × 10⁻⁵ | 1.96 × 10⁻⁵ | 0.164       | ❌                 |
| `gov_debt_pct_gdp`  | −0.0034       | 0.003       | 0.218       | ❌                 |
| `gini_index`        | 0.0326        | 0.044       | 0.463       | ❌                 |

**Interpretation for Italy:** Only `gdp_ppp_percapita` (development level) is statistically significant at the 5% level under HC3. The coefficient implies that for each additional USD 1,000 of GDP per capita (PPP), Italian hi-tech exports are associated with approximately a **2.7% increase**, holding other predictors constant. None of the innovation-specific inputs (patents, R&D) or institutional variables (debt, Gini) reach significance once development level is accounted for.

**Caveat specific to Italy:** Durbin-Watson = 1.176 is below the conventional 1.5 threshold, indicating positive residual autocorrelation. The point estimates are still consistent, but standard errors may be understated even under HC3. A Newey–West or ARDL specification (see Analysis 2) would strengthen inference before any causal claim is made.

---

## Results — Finland

### Elimination sequence

Two predictors were removed due to high VIF:

| Iteration | Predictor dropped  | VIF at removal | Remaining predictors |
| --------- | ------------------ | -------------- | -------------------- |
| 1         | `journal_articles` | 22.63          | 5                    |
| 2         | `gov_debt_pct_gdp` | 13.45          | 4                    |

After iteration 3, all remaining VIFs were ≤ 5 (max = 2.62 for `patents_total`).

### Final model — Finland

**Predictors retained:** `rd_pct_gdp`, `gdp_ppp_percapita`, `patents_total`, `gini_index`

**Fit statistics:**

- N = 22 observations
- R² = 0.871
- Adjusted R² = 0.840
- F-statistic = 18.70 (p ≈ 4.7 × 10⁻⁶, HC3)
- AIC = −5.40
- Durbin-Watson = 1.790
- Omnibus p = 0.020 (mild non-normality; JB p = 0.067)

### Coefficients — Finland (HC3 robust SEs are authoritative)

| Predictor           | Coefficient   | HC3 SE      | HC3 p-value | Significant at 5%? |
| ------------------- | ------------- | ----------- | ----------- | ------------------ |
| const               | 5.934         | 3.660       | 0.105       | ❌                 |
| `rd_pct_gdp`        | −0.0371       | 0.275       | 0.892       | ❌                 |
| `gdp_ppp_percapita` | −1.747 × 10⁻⁵ | 4.23 × 10⁻⁶ | < 0.001     | ✅ (negative)      |
| `patents_total`     | 9.0 × 10⁻⁴    | —           | 0.011       | ✅ (positive)      |
| `gini_index`        | 0.5845        | 0.130       | < 0.001     | ✅ (positive)      |

**Interpretation for Finland:** Three of four retained predictors are statistically significant at the 5% level under HC3, and two of the signs are counterintuitive:

- **`patents_total` (positive, p = 0.011):** Each additional patent is associated with roughly a **0.09% increase** in hi-tech exports (since the target is logged, β = 0.0009 ≈ 0.09% per patent). Over a 1,000-patent swing this compounds to a substantial 9% effect. Interpretable as "innovation output volume drives commercial hi-tech activity."
- **`gini_index` (positive, p < 0.001):** A 1-point increase in the Gini coefficient (more inequality) is associated with roughly a **79% increase** in hi-tech exports. **This is counterintuitive and should be flagged as interpretive caution.** The likely explanation is that both series trend upward independently across 2004–2025 (Gini 26.8→28.3, exports $8.7B→$17.0B), so the coefficient captures a shared trend rather than a causal inequality-export channel. Do not conclude "more inequality helps exports."
- **`gdp_ppp_percapita` (negative, p < 0.001):** **Also counterintuitive.** A USD 1,000 increase in GDP per capita is associated with a ~1.7% _decrease_ in hi-tech exports, conditional on the other predictors. The most likely explanation is a collinearity artifact: with `rd_pct_gdp` and `patents_total` already in the model, the residual variation in `gdp_ppp_percapita` captures business-cycle effects (2015–2020 was a period of rising GDP but stagnating exports) rather than cross-sectional development.
- **`rd_pct_gdp` (not significant, p = 0.892):** Surprisingly, R&D intensity is **not** a significant predictor of hi-tech exports in Finland once the other three are controlled. The coefficient is essentially zero. This is important: Finland's high R&D is not showing a direct linear association with export levels in this specification. Possible explanations include (a) R&D → exports operates with a lag (see Analysis 2 DLM), (b) Nokia/electronics shock in 2009–2013 decoupled the two series, (c) R&D intensity is spent on non-exported innovation (basic research, public sector).

**Caveat specific to Finland:** Omnibus p = 0.020 (< 0.05) indicates residuals are mildly non-normal under OLS; the HC3 standard errors partially compensate but the small-sample normality assumption is not perfectly satisfied. Interpret coefficient signs with particular care given the two counterintuitive results.

---

## Cross-country comparison

The two countries produce **substantially different models** from the same 6-variable pool:

| Aspect                   | Italy                                                                  | Finland                                                          |
| ------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Final subset             | `gdp_ppp_percapita`, `patents_total`, `gov_debt_pct_gdp`, `gini_index` | `rd_pct_gdp`, `gdp_ppp_percapita`, `patents_total`, `gini_index` |
| Shared features          | `gdp_ppp_percapita`, `patents_total`, `gini_index`                     | (same three)                                                     |
| Unique feature           | `gov_debt_pct_gdp`                                                     | `rd_pct_gdp`                                                     |
| Significant predictors   | 1 of 4 (`gdp_pc`)                                                      | 3 of 4 (`gdp_pc`, `patents`, `gini`)                             |
| R²                       | 0.933                                                                  | 0.871                                                            |
| `gdp_pc` sign            | **positive**                                                           | **negative**                                                     |
| `patents_total` sign     | negative (n.s.)                                                        | positive (sig.)                                                  |
| `gini_index` sign        | positive (n.s.)                                                        | positive (sig.)                                                  |
| R&D intensity in model?  | No (dropped by VIF)                                                    | Yes (but not significant)                                        |
| Residual autocorrelation | DW = 1.18 (concern)                                                    | DW = 1.79 (acceptable)                                           |

**The most important cross-country finding is the _sign flip_ on `gdp_ppp_percapita`.** Italy shows the intuitive positive association (higher income → more hi-tech exports); Finland shows a negative association. This is not a data error — it reflects conditional-on-other-predictors dynamics and the effect of the 2009 Nokia shock on Finland's exports, which dropped 48% in one year while GDP per capita kept rising.

**The second most important finding is that R&D intensity does not linearly explain hi-tech exports in either country.** For Italy, it was dropped for collinearity with GDP per capita. For Finland, it was retained but not significant. This is a substantive finding: **R&D's effect on exports, if any, operates with a time lag**, which is what Analysis 2 (the distributed lag model) investigates.

---

## Critical limitations

Anyone reading or quoting these results should understand the following:

1. **Small sample.** N = 22 per country. With 4 final predictors, residual df = 17. Only large effects are detectable; a "non-significant" predictor may simply be undetectable at this sample size. Do not conclude a variable "has no effect" from a single regression with N = 22.

2. **Levels regression on trending data.** Both target and several predictors trend upward over 2004–2025. High R² (0.87–0.93) is partly due to shared trends rather than causal co-movement. The log specification partially mitigates but does not eliminate this (log of a trending series is still trending). A first-differences or ARDL specification would give a stronger causal inference test.

3. **Temporal autocorrelation.** Italy's Durbin-Watson = 1.18 and Finland's = 1.79. HC3 standard errors do not correct for autocorrelation; Newey–West standard errors or a proper time-series model would. The reported p-values may be optimistic.

4. **No causal claim.** Coefficient signs and magnitudes describe conditional associations in a 22-year window. They do not establish that "X causes Y." A change in the predictor today does not mechanically produce the fitted change in the target tomorrow.

5. **Gini coefficient interpretation is especially fragile.** Both Gini series move within a range of ±1.5 points (Italy: 32.9–35.9; Finland: 26.8–28.3). A coefficient of "79% exports per Gini point" extrapolates a full-point change from data that only distinguishes fractions of a point — this is semantically unstable even if statistically significant.

6. **Structural breaks matter.** Finland's 2009 hi-tech export crash (−48% in one year) and Italy's 2022–2024 surge (+55% in three years) are unusual events that heavily influence the level regressions. A structural break or dummy-variable approach would be a natural next step.

---

## Frequent questions (for retrieval)

**Q: What is the target variable?**
A: The target is `hitech_exports_usd` — high-technology exports in current US dollars — from the World Bank. It is used in log-transformed form (`log_hitech_exports_usd = log(1 + value)`) as the primary specification. Coefficients in the log model are approximate percentage effects on exports.

**Q: Which variables are significant predictors of hi-tech exports?**
A: For Italy, only `gdp_ppp_percapita` is significant at 5% (positive, p < 0.001); patents, government debt, and Gini are not. For Finland, `gdp_ppp_percapita` (negative), `patents_total` (positive), and `gini_index` (positive) are all significant at 5% under HC3; `rd_pct_gdp` is not. The cross-country sign flip on `gdp_ppp_percapita` is the most notable divergence.

**Q: Does R&D spending drive hi-tech exports?**
A: Not directly in this regression. Italy dropped `rd_pct_gdp` during VIF elimination; Finland retained it but it is not statistically significant (p ≈ 0.89). The Analysis 2 distributed-lag model tests whether R&D has a delayed effect. A "no" here does not mean R&D is unimportant — it means R&D does not linearly co-move with exports at the same-year horizon in these 22-year samples.

**Q: Why was hi-tech exports as a percentage of manufacturing removed from the model?**
A: Because it is tautological with the target. `hitech_pct_manufactured = hi-tech exports / total manufactured exports × 100`. Its numerator is the target variable. Including both in a regression is a mathematical identity, not a test of a hypothesis. An early iteration of this analysis used it and produced spurious coefficients; the revised model excludes it.

**Q: Why was R&D per capita excluded?**
A: Because `rd_per_capita_ppp = rd_pct_gdp × gdp_ppp_percapita`. It is an exact algebraic function of two other predictors in the pool. Including all three causes perfect collinearity (VIF > 15,000) and forces the VIF procedure to drop features by numerical coincidence rather than economic logic. Use either `rd_pct_gdp` or `rd_per_capita_ppp`, never both with `gdp_ppp_percapita`.

**Q: Why does Finland show a negative coefficient on GDP per capita?**
A: This is a conditional-on-other-predictors effect. With R&D intensity and patent count already in the model, the residual GDP-per-capita variation in Finland picks up business-cycle dynamics — particularly the 2009 Nokia shock, when exports crashed while GDP per capita kept rising. The unconditional relationship between GDP per capita and exports in Finland is positive; the negative coefficient only appears once patents and R&D are controlled. It should not be interpreted as "higher income reduces exports."

**Q: Why is the Gini coefficient positive for Finland?**
A: Because both Gini and hi-tech exports trended upward in Finland across 2004–2025. The coefficient captures shared trend rather than a causal inequality-export channel. Given that the entire Gini range is only 26.8 to 28.3, extrapolating a full Gini point is unreliable. Treat this coefficient as descriptive of the joint trend, not as a policy lever.

**Q: Is this a causal analysis?**
A: No. This is a descriptive, exploratory regression on 22 annual observations per country. It identifies conditional associations within the sample period. Establishing causality would require panel data with more countries, quasi-experimental methods, or a proper time-series causal model (VAR, ARDL, difference-in-differences with a policy shock). Any claim that "patents cause exports" or "inequality drives exports" is not supported by these results.

**Q: How many observations are in each regression?**
A: 22 per country (2004–2025 annual, one row per year, no rows lost to listwise deletion because all candidate predictors are complete). Residual degrees of freedom in the final model is 17.

**Q: What does the AIC comparison tell us?**
A: Italy's AIC = −47.04 is much lower than Finland's AIC = −5.40, but the AICs are not directly comparable across countries because they correspond to different target series (Italy's exports are ~5× larger than Finland's in USD). AIC is only meaningful for comparing models fit to the same target.

**Q: Why does the model use HC3 robust standard errors?**
A: HC3 corrects standard errors for heteroskedasticity without assuming the residual variance is constant across observations. This is important for both countries because (a) the 2009 GFC and 2020 COVID shocks produce large variance changes in the export series, and (b) Finland's residuals fail normality tests (Omnibus p = 0.020). When OLS and HC3 p-values disagree, HC3 is authoritative. For Italy, both agree — only GDP per capita is significant. For Finland, both agree on which variables are significant but HC3 tightens the Gini and patent results slightly.

**Q: What is the Durbin-Watson statistic and why does it matter?**
A: Durbin-Watson tests for first-order autocorrelation in residuals. A value near 2.0 indicates no autocorrelation; values < 1.5 (Italy's 1.176) suggest positive autocorrelation, meaning the standard errors may be understated and p-values optimistic. Finland's 1.790 is acceptable but not ideal. A Newey–West correction or a dynamic model would be advisable for a final inference pass — this is what Analysis 2 (distributed lag model) contributes.

**Q: What are the practical takeaways for someone reading the dashboard?**
A: (1) Development level (GDP per capita) is the strongest and most consistently significant predictor, especially for Italy. (2) Patent counts matter for Finland's exports but not detectably for Italy's in this specification. (3) R&D intensity's effect, if any, is not visible in contemporaneous regressions — see the DLM analysis. (4) Inequality's apparent effect is trend-driven and should not be interpreted causally. (5) These are 22-year descriptive associations, not forecasts or causal estimates.

---

## Related analyses

- **`00_data_preparation.md`** — Documents how the raw World Bank data was cleaned, renamed, interpolated, and enriched with population data. All features used here are defined there.
- **`02_distributed_lag_model.md`** — Tests whether R&D spending affects hi-tech exports with a 0–5 year lag, addressing the "R&D not significant" finding above.
- **`03_feature_engineering.md`** — Documents all engineered features (lags, per-capita, growth rates, efficiency ratios) and their provenance tracking.

---

## Reproducibility

The analysis code is in notebook `01_data_preparation.ipynb`, cells F2–F9. Key configuration:

```python
TARGET_LEVELS = 'hitech_exports_usd'
TARGET_LOG    = 'log_hitech_exports_usd'
VIF_THRESHOLD = 5.0
CANDIDATES = ['rd_pct_gdp', 'gdp_ppp_percapita', 'patents_total',
              'journal_articles', 'gov_debt_pct_gdp', 'gini_index']
```
