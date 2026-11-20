import {
    AnalysisHero,
    CaveatCard,
    CoefTable,
    Faq,
    FitChips,
    ReadingCard,
    RemovalTrail,
    SigBadge,
    VifBars,
} from "@/components/analysis";
import { CountryTag } from "@/components/atoms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VIF_METADATA, VIF_RESULTS, type VifModel } from "@/data/results";
import { COUNTRIES, type Country } from "@/data/series";
import { pVal } from "@/lib/format";
import { prettyFeature } from "@/lib/labels";
import { useState } from "react";

const FAQ = [
  {
    q: "Does R&D spending drive hi-tech exports?",
    a: "Not directly in this regression. Italy dropped rd_pct_gdp during VIF elimination; Finland retained it but it is not significant (p ≈ 0.89). The distributed-lag model tests delayed effects. 'No' here means R&D does not linearly co-move with exports at the same-year horizon in these 22-year samples — not that R&D is unimportant.",
  },
  {
    q: "Why was hi-tech share of manufacturing removed?",
    a: "It is tautological with the target: hitech_pct_manufactured = hi-tech exports ÷ manufactured exports × 100. Its numerator IS the target. An early iteration included it and produced spuriously significant coefficients and an inflated R²; the revised pool never uses it.",
  },
  {
    q: "Why was R&D per capita excluded?",
    a: "rd_per_capita_ppp = rd_pct_gdp × gdp_ppp_percapita — an exact algebraic function of two other candidates (VIF > 15,000 when combined). Keeping all three forces the procedure to drop features by numerical coincidence rather than economic logic. patents_per_million was excluded for the same reason (VIF > 20,000).",
  },
  {
    q: "Why does Finland show a negative GDP-per-capita coefficient?",
    a: "A conditional-on-other-predictors effect. With R&D and patents controlled, residual GDP variation captures business-cycle dynamics — above all 2009, when exports crashed 48% while PPP income kept rising. The unconditional relationship is positive. Do not read it as 'higher income reduces exports'.",
  },
  {
    q: "Why is the Gini coefficient positive and significant for Finland?",
    a: "Shared trend: both Gini and exports drifted upward across 2004–2025. The whole Gini range is 26.8–28.3, so extrapolating a full point ('+79% exports per Gini point') is semantically unstable even when statistically significant. Treat it as descriptive of the joint trend, never a policy lever.",
  },
  {
    q: "Is this causal? Why HC3?",
    a: "No — descriptive conditional associations on 22 annual observations. HC3 corrects standard errors for heteroskedasticity (GFC/pandemic variance shifts; Finland's residuals fail normality, Omnibus p = 0.020). Where OLS and HC3 disagree, HC3 is authoritative. HC3 does not fix autocorrelation — Italy's DW = 1.18 still warns of optimistic p-values.",
  },
];

function CountryVif({
  country,
  model,
  spec,
}: {
  country: Country;
  model: VifModel;
  spec: "log" | "levels";
}) {
  const dropped = new Set(model.removal_history.map((s) => s.dropped));
  const accent = country === "Italy" ? "var(--italy)" : "var(--finland)";
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-3">
          <CountryTag country={country} />
          <span className="text-xs font-normal text-muted-foreground">
            target: <span className="font-mono">{model.target}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <FitChips fit={model.fit} n={model.n_obs} />

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Elimination sequence
          </div>
          <RemovalTrail steps={model.removal_history} />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Initial VIFs — rose = eliminated, gold = above threshold
          </div>
          <VifBars
            entries={model.vif_initial}
            dropped={dropped}
            accent={accent}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Final coefficients · HC3 authoritative
          </div>
          <CoefTable
            rows={model.coefficients}
            target={spec === "log" ? "log-exports" : "level-exports"}
            caption={
              spec === "log"
                ? "Log target: effects read as approximate % changes in exports."
                : "Levels target (robustness): effects in current US$."
            }
          />
        </div>

        {country === "Italy" ? (
          <ReadingCard title="Reading — Italy">
            <p>
              Only <strong>GDP per capita</strong> survives at 5% under HC3:
              each additional $1,000 of PPP income is associated with ≈{" "}
              <strong>+2.7% hi-tech exports</strong>, holding the rest constant.
              Patents, debt and Gini add nothing detectable once development
              level is accounted for — and R&D intensity was eliminated for
              collinearity before inference even began.
            </p>
            <p>
              DW = 1.176 flags positive residual autocorrelation: point
              estimates stay consistent, but even HC3 p-values may be
              optimistic. Newey–West or an ARDL pass would be needed before any
              stronger claim.
            </p>
          </ReadingCard>
        ) : (
          <ReadingCard title="Reading — Finland">
            <p>
              Three of four predictors are significant, two with
              counterintuitive signs.
              <strong> Patents</strong>: +0.087% exports per patent (p = 0.011)
              — innovation output volume tracks commercial hi-tech activity.{" "}
              <strong>Gini</strong>: positive (p &lt; 0.001) but a shared-trend
              artefact over a ±1.5-pt range.
              <strong> GDP pc</strong>: negative (p &lt; 0.001) — the 2009
              Nokia-shock cycle artefact, not an income effect.
            </p>
            <p>
              <strong>R&D intensity is essentially zero</strong> (p = 0.89):
              Finland's high R&D shows no direct linear association with export
              levels here — lagged effects (Analysis 2), the Nokia decoupling,
              or non-exported public research are the candidate explanations.
            </p>
          </ReadingCard>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalysisVifPage() {
  const [spec, setSpec] = useState<"log" | "levels">("log");
  const it = VIF_RESULTS.Italy.log;
  const fi = VIF_RESULTS.Finland.log;

  const comparison = [
    "gdp_ppp_percapita",
    "patents_total",
    "gini_index",
    "rd_pct_gdp",
    "gov_debt_pct_gdp",
  ].map((f) => {
    const itRow = it.coefficients.find((c) => c.feature === f);
    const fiRow = fi.coefficients.find((c) => c.feature === f);
    const cell = (row: typeof itRow) => {
      if (!row)
        return (
          <span className="text-xs text-muted-foreground">dropped by VIF</span>
        );
      return (
        <span className="inline-flex items-center gap-2 text-xs">
          <span className="font-mono tabular">{row.coef >= 0 ? "+" : "−"}</span>
          <SigBadge row={row} />
          <span className="text-muted-foreground tabular">
            p {pVal(row.p_hc3)}
          </span>
        </span>
      );
    };
    return { f, itRow, fiRow, cell };
  });

  return (
    <div className="space-y-8">
      <AnalysisHero
        index="01"
        title="Iterative VIF regression — what travels with hi-tech exports?"
        lede="Backward VIF elimination (threshold 5, one variable per iteration) over a six-variable pool, then OLS with HC3 robust errors, fit separately per country — no pooling across a ~10× scale gap. The log-transformed export target is primary; levels are a robustness check. N = 22 country-years each: descriptive associations, never causal estimates."
        chips={[
          { label: "Target", value: "log(hi-tech exports $)" },
          {
            label: "Pool",
            value: `${VIF_METADATA.candidate_pool.length} candidates`,
          },
          { label: "VIF ≤", value: "5.0" },
          { label: "Errors", value: "HC3" },
          { label: "N", value: "22 × 2" },
        ]}
        ask="Why does Finland show a negative GDP-per-capita coefficient in the VIF export model, and is it causal?"
      />

      <Tabs
        value={spec}
        onChange={(v) => setSpec(v as "log" | "levels")}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <TabsList>
            <TabsTrigger value="log">Log target · primary</TabsTrigger>
            <TabsTrigger value="levels">Levels · robustness</TabsTrigger>
          </TabsList>
          {spec === "levels" && (
            <span className="text-xs text-gold">
              Robustness only — the log specification is authoritative (target
              spans ~2 orders of magnitude).
            </span>
          )}
        </div>
        {(["log", "levels"] as const).map((s) => (
          <TabsContent key={s} value={s} className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {COUNTRIES.map((c) => (
                <CountryVif
                  key={c}
                  country={c}
                  model={VIF_RESULTS[c][s]}
                  spec={s}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Cross-country comparison · log specification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Predictor</TableHead>
                  <TableHead>Italy</TableHead>
                  <TableHead>Finland</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.map((r) => (
                  <TableRow key={r.f}>
                    <TableCell className="font-medium">
                      {prettyFeature(r.f)}
                    </TableCell>
                    <TableCell>{r.cell(r.itRow)}</TableCell>
                    <TableCell>{r.cell(r.fiRow)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Fit</TableCell>
                  <TableCell className="text-xs tabular">
                    R² {it.fit.r_squared.toFixed(3)} · DW {it.fit.dw.toFixed(2)}{" "}
                    (concern)
                  </TableCell>
                  <TableCell className="text-xs tabular">
                    R² {fi.fit.r_squared.toFixed(3)} · DW {fi.fit.dw.toFixed(2)}{" "}
                    (acceptable)
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <Alert className="border-finland/40 bg-finland/5">
            <AlertTitle className="text-sm text-finland">
              The two headline findings
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              (1) The sign flip on GDP per capita is not a data error — it
              reflects conditional dynamics and Finland's 2009 export crash
              (−48% in one year while income rose). (2) R&D intensity does not
              linearly explain exports in either country at the same-year
              horizon: dropped for Italy, retained-but-zero for Finland. That is
              precisely the question Analysis 2 takes to the lag structure.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <CaveatCard
        items={[
          "Small sample: N = 22 per country, residual df = 17. 'Non-significant' can mean undetectable, not absent.",
          "Levels on trending data: high R² (0.87–0.93) partly reflects shared trends; logging mitigates but does not eliminate this.",
          "Autocorrelation: Italy DW = 1.18, Finland 1.79. HC3 does not correct autocorrelation — p-values may be optimistic.",
          "Gini fragility: both series move within ±1.5 points; full-point effect extrapolations are semantically unstable.",
          "Structural breaks: Finland's 2009 crash and Italy's 2022–24 surge heavily influence level regressions; break dummies are a natural next step.",
          "No causal claim: establishing causality would need panel data, quasi-experiments, or a proper time-series causal design.",
        ]}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Frequent questions</h2>
        <Faq items={FAQ} />
      </section>
    </div>
  );
}
