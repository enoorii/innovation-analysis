import {
    AnalysisHero,
    CaveatCard,
    FitChips,
    ReadingCard,
    VifBars,
} from "@/components/analysis";
import { CountryTag, StatBox } from "@/components/atoms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DLM_METADATA, DLM_RESULTS, type DlmModel } from "@/data/results";
import { COUNTRIES, type Country } from "@/data/series";
import { pVal, usd } from "@/lib/format";
import { prettyFeature } from "@/lib/labels";
import { AlertTriangle } from "lucide-react";
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";

function LagProfile({ model, country }: { model: DlmModel; country: Country }) {
  const data = model.lag_table.map((l) => ({
    lag: `t−${l.lag}`,
    coefB: l.coef / 1e9,
    p_hc3: l.p_hc3,
    p_std: l.p_std,
    sig10: l.sig10_hc3,
    positive: l.coef >= 0,
  }));
  const accent = country === "Italy" ? "var(--italy)" : "var(--finland)";
  return (
    <ChartContainer
      config={{ coefB: { label: "Coefficient ($B)", color: accent } }}
      height={260}
    >
      <BarChart data={data} margin={{ top: 20, right: 8, bottom: 4, left: 0 }}>
        <XAxis
          dataKey="lag"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "R&D lag (years)",
            position: "insideBottom",
            offset: -2,
            fill: "var(--muted-foreground)",
            fontSize: 10,
          }}
        />
        <YAxis
          width={56}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}B`}
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
          content={
            <ChartTooltipContent
              formatter={(v) =>
                `${v >= 0 ? "+" : "−"}$${Math.abs(v).toFixed(1)}B per +1pp R&D`
              }
            />
          }
        />
        <Bar
          dataKey="coefB"
          name="Coefficient ($B)"
          radius={[5, 5, 0, 0]}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell
              key={d.lag}
              fill={
                d.sig10
                  ? d.positive
                    ? "var(--italy)"
                    : "var(--rose)"
                  : "var(--muted-foreground)"
              }
              fillOpacity={d.sig10 ? 0.9 : 0.3}
              stroke={
                d.sig10 ? (d.positive ? "var(--italy)" : "var(--rose)") : "none"
              }
            />
          ))}
          <LabelList
            dataKey="p_hc3"
            position="top"
            formatter={(p: number) => `p ${pVal(p)}`}
            style={{ fill: "var(--muted-foreground)", fontSize: 9.5 }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function CountryDlm({ country }: { country: Country }) {
  const model = DLM_RESULTS[country];
  const cumulative = model.lag_table.reduce((s, l) => s + l.coef, 0);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-3">
          <CountryTag country={country} />
          <span className="text-xs font-normal text-muted-foreground">
            levels target · control: GDP per capita
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <FitChips fit={model.fit} n={model.n_obs} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatBox
            label="Most significant lag"
            value={`t−${model.most_significant_lag.lag}`}
            sub={`p(HC3) ${pVal(model.most_significant_lag.p_hc3)}`}
          />
          <StatBox
            label="Cumulative multiplier"
            value={`${cumulative >= 0 ? "+" : "−"}${usd(Math.abs(cumulative))}`}
            sub="Σ lags 0–5, per +1pp R&D"
          />
          <StatBox
            label="Single-lag robustness"
            value={`${model.robustness.coef >= 0 ? "+" : "−"}${usd(Math.abs(model.robustness.coef))}`}
            sub={`p(HC3) ${pVal(model.robustness.p_hc3)}`}
          />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lag profile
            <Badge
              variant="outline"
              className="text-[10px] normal-case text-muted-foreground"
            >
              solid = sig. at 10% (HC3) · faded = n.s.
            </Badge>
          </div>
          <LagProfile model={model} country={country} />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            VIF by lag — every lag exceeds the threshold of 5
          </div>
          <VifBars
            entries={model.lag_vifs}
            dropped={new Set()}
            accent={country === "Italy" ? "var(--italy)" : "var(--finland)"}
          />
        </div>

        {country === "Italy" ? (
          <ReadingCard title="Reading — Italy">
            <p>
              The contemporaneous coefficient is large and{" "}
              <strong>negative</strong> (−$66.6B per +1pp R&D, p = 0.056) while{" "}
              <strong>lag 4 turns positive</strong> (+$60.1B, p = 0.057) — both
              only marginal at 10%. The shape echoes the narrative that
              2010–2015 investment monetised in 2022–2024, but with lag VIFs of
              14–37 and trending I(1) levels it cannot bear causal weight.
            </p>
            <p>
              The negative now-effect has a mechanical candidate: during the
              sovereign-debt crisis GDP fell, so R&D% rose through its
              denominator while exports stagnated (see the Eurozone event band).
              The single-lag robustness model (−$32.8B, p = 0.002) largely
              captures that conditional pattern, not R&D harming exports.
            </p>
          </ReadingCard>
        ) : (
          <ReadingCard title="Reading — Finland">
            <p>
              <strong>No lag survives HC3</strong> in the full profile (all p ≥
              0.15), and lag VIFs reach 66 — the design cannot separate adjacent
              R&D years. The single-lag model is strongly positive (+$3.15B, p
              &lt; 0.001), but Finland's exports collapsed after 2008 while R&D
              intensity stayed high: a positive conditional association is
              exactly what a shared-trend / structural-break artefact looks
              like.
            </p>
            <p>
              Honest conclusion: this specification cannot resolve the
              R&D→export lag for Finland. The Nokia break argues for break
              dummies or an ARDL/VECM pass before any lag claim.
            </p>
          </ReadingCard>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalysisDlmPage() {
  return (
    <div className="space-y-8">
      <AnalysisHero
        index="02"
        title="Distributed lag model — does R&D arrive late?"
        lede={`Analysis 1 found R&D intensity invisible at the same-year horizon. The DLM asks whether it travels with hi-tech exports with a 0–5 year delay: ${DLM_METADATA.model}. Estimated in levels on 17 usable country-years per country (five lags consumed), with HC3 errors and ${prettyFeature("gdp_ppp_percapita")} as control.`}
        chips={[
          { label: "Target", value: "hi-tech exports $" },
          { label: "Lags", value: "0–5 years" },
          { label: "N", value: "17 × 2" },
          { label: "Errors", value: "HC3" },
        ]}
        ask="What does the distributed lag model say about R&D and hi-tech exports, and how strong is the evidence?"
      />

      <Alert variant="destructive" className="border-rose/50 bg-rose/5">
        <AlertTriangle className="size-4" aria-hidden />
        <AlertTitle className="text-sm">
          Spurious-regression risk — from the model metadata
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          “{DLM_METADATA.warning}” Every series here is integrated of order one;
          a levels DLM on trending data can manufacture fit. Read everything
          below as a descriptive lag profile. An ARDL/VECM specification is the
          required next step for any causal claim.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 xl:grid-cols-2">
        {COUNTRIES.map((c) => (
          <CountryDlm key={c} country={c} />
        ))}
      </div>

      <CaveatCard
        items={[
          "All series I(1): levels regression R² of 0.98/0.91 is exactly what shared trends produce. The DW near 2 for Italy does not rescue a spurious levels fit.",
          "Lag multicollinearity: VIFs 14–37 (Italy) and 7–66 (Finland) — adjacent R&D years are nearly the same variable at N = 17.",
          "Nothing is significant at 5% under HC3 in either full profile; Italy's lag-0 and lag-4 reach only the 10% level.",
          "The single-lag robustness models trade omitted-lag bias for stability — their strong p-values reflect trend co-movement, not identified effects.",
          "Structural breaks (Nokia 2009–2014; Italy's 2022–24 surge) sit inside the lag window and contaminate every coefficient.",
          "Next steps: first-differences or ARDL bounds testing, break dummies, and Newey–West errors before any inference upgrade.",
        ]}
      />
    </div>
  );
}
