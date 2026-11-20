import {
    AnalysisHero,
    CaveatCard,
    CoefTable,
    FitChips,
    ReadingCard,
    RemovalTrail,
    VifBars,
} from "@/components/analysis";
import { CountryTag } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    GII_LAG_SENSITIVITY,
    GII_METADATA,
    GII_RESULTS,
    type GiiModel,
} from "@/data/results";
import { COUNTRIES, type Country } from "@/data/series";
import { pVal, signed } from "@/lib/format";
import { prettyFeature } from "@/lib/labels";
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";

const LAG_KEYS = ["rd_pct_gdp", "rd_pct_gdp_lag1", "rd_pct_gdp_lag2"] as const;

function SensitivityBars({ country }: { country: Country }) {
  const sens = GII_LAG_SENSITIVITY[country];
  const data = LAG_KEYS.map((k, i) => ({
    lag: `t−${i}`,
    coef: sens[k].rd_coef,
    p: sens[k].rd_p_hc3,
  }));
  return (
    <ChartContainer
      config={{
        coef: { label: "R&D coefficient (GII pts)", color: "var(--violet)" },
      }}
      height={200}
    >
      <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="lag"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          width={48}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
          content={
            <ChartTooltipContent
              formatter={(v) => `${signed(v)} GII pts per +1pp R&D`}
            />
          }
        />
        <Bar
          dataKey="coef"
          name="R&D coefficient"
          radius={[5, 5, 0, 0]}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell
              key={d.lag}
              fill={d.coef >= 0 ? "var(--finland)" : "var(--rose)"}
              fillOpacity={0.45}
            />
          ))}
          <LabelList
            dataKey="p"
            position="top"
            formatter={(p: number) => `p ${pVal(p)}`}
            style={{ fill: "var(--muted-foreground)", fontSize: 9.5 }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function CountryGii({ country, model }: { country: Country; model: GiiModel }) {
  const dropped = new Set(model.removal_history.map((s) => s.dropped));
  const sens = GII_LAG_SENSITIVITY[country];
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-3">
          <CountryTag country={country} />
          <span className="text-xs font-normal text-muted-foreground">
            GII score · {country === "Italy" ? "2011–2025" : "2013–2025"}
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
            Initial VIFs
          </div>
          <VifBars
            entries={model.vif_initial}
            dropped={dropped}
            accent={country === "Italy" ? "var(--italy)" : "var(--finland)"}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Final coefficients
            <Badge
              variant="outline"
              className="border-gold/50 text-[10px] normal-case text-gold"
            >
              hitech share flagged: partially tautological with GII
            </Badge>
          </div>
          <CoefTable
            rows={model.coefficients}
            target="gii"
            caption="Target: GII score (0–100). Effects in index points. HC3 authoritative."
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            R&D lag sensitivity — each lag in isolation (same controls)
          </div>
          <SensitivityBars country={country} />
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lag</TableHead>
                  <TableHead className="text-right">R&D coef</TableHead>
                  <TableHead className="text-right">p (HC3)</TableHead>
                  <TableHead className="text-right">R²</TableHead>
                  <TableHead className="text-right">Adj. R²</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LAG_KEYS.map((k, i) => (
                  <TableRow key={k}>
                    <TableCell className="font-medium">
                      {prettyFeature(k)}
                      {i === 0 ? " (t)" : ""}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {signed(sens[k].rd_coef)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {pVal(sens[k].rd_p_hc3)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {sens[k].r_squared.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {sens[k].adj_r_squared.toFixed(3)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {country === "Italy" ? (
          <ReadingCard title="Reading — Italy">
            <p>
              The model as a whole is not significant (F p = 0.585) and adjusted
              R² is
              <strong> negative</strong> (−0.083): after the degrees-of-freedom
              penalty it fits worse than a mean-only model. No coefficient
              approaches significance. The lag check shows{" "}
              <strong>sign instability</strong> — +11.4 → −8.8 → −16.3 across t,
              t−1, t−2 — the classic small-N symptom of noise, not structure.
            </p>
            <p>
              This matches the qualitative diagnosis: Italy's GII drift is
              driven by stagnating inputs and a structural translation
              bottleneck (firm size, TTOs, VC), which no single linear lever in
              this pool captures at N = 15.
            </p>
          </ReadingCard>
        ) : (
          <ReadingCard title="Reading — Finland">
            <p>
              Same verdict, smaller sample: F p = 0.712, adjusted R² = −0.208,
              nothing significant. The lag pattern is at least{" "}
              <strong>coherent</strong> — the R&D coefficient rises 0.67 → 1.40
              → 1.86 with the lag, consistent with delayed conversion — but
              every p ≥ 0.62, so it is a hint for future data, not a finding.
            </p>
            <p>
              Remember what GII is: a composite that already embeds R&D, patents
              and exports in its pillars. Regressing it on its own ingredients
              is partially tautological — which is why patents, articles and
              export levels were excluded up front, and the retained hi-tech
              share carries an explicit flag.
            </p>
          </ReadingCard>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalysisGiiPage() {
  return (
    <div className="space-y-8">
      <AnalysisHero
        index="03"
        title="GII drivers — can any lever move the composite?"
        lede="The same VIF≤5 + HC3 discipline applied to the Global Innovation Index score. The candidate pool deliberately excludes patents, journal articles and hi-tech export levels — they are ingredients of the index itself. R&D enters at lags 0–2 with a sensitivity check; the surviving lag is chosen by elimination, then each lag is tested in isolation."
        chips={[
          { label: "Target", value: "GII score (0–100)" },
          {
            label: "Pool",
            value: `${GII_METADATA.candidate_pool.length} candidates`,
          },
          { label: "N", value: "15 (IT) · 13 (FI)" },
          { label: "Excluded", value: "3 tautological" },
        ]}
        ask="Why can't the GII regression find any significant drivers, and what does that mean?"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {COUNTRIES.map((c) => (
          <CountryGii key={c} country={c} model={GII_RESULTS[c]} />
        ))}
      </div>

      <CaveatCard
        title="Metadata notes — carried verbatim from the analysis"
        items={GII_METADATA.notes}
      />
    </div>
  );
}
