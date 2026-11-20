/**
 * Editorial takes distilled from data/knowledge/italy-analysis.md and
 * finland-analysis.md (section references preserved per take).
 */
import type { MetricKey } from "./series";

export type TakeTone = "positive" | "warning" | "negative" | "neutral";

export interface Take {
  verdict: string;
  tone: TakeTone;
  paragraphs: string[];
  stats: { label: string; value: string }[];
  source: string;
}

export const TAKES: Record<MetricKey, { Italy: Take; Finland: Take }> = {
  patents_residents: {
    Italy: {
      verdict: "Two-decade stagnation",
      tone: "warning",
      paragraphs: [
        "Resident patenting has been essentially flat for twenty years: 9,255 in 2007, a debt-crisis trough of 8,307 in 2013, and 8,478 in 2023 — a net decline of roughly 8%. The pandemic years produced the series record (10,061 and 10,281), consistent with a Europe-wide accelerator of medical innovation and public funding.",
        "The 2024 signal matters: Italian EPO applications fell 4.5% to 4,853, the first genuine contraction in a decade — a financing and investment slowdown, not an Italy-specific collapse. Structurally, firms increasingly route protection through the EPO, so the national resident series understates inventive output. Italy files about one-fifth of Germany's EPO volume: ~3,100 international filings a year against 16,800 in Germany and 8,100 in France. The gap is a scale gap in the commercialisation-facing segment, not a collapse of inventiveness.",
      ],
      stats: [
        { label: "2007 → 2023", value: "≈ −8%" },
        { label: "Series peak (2021)", value: "10,281" },
        { label: "EPO 2024", value: "4,853 (−4.5%)" },
        { label: "vs Germany EPO", value: "≈ 1/5" },
      ],
      source: "italy-analysis.md › 2.1 Patent Metrics",
    },
    Finland: {
      verdict: "Nokia-shaped volatility",
      tone: "warning",
      paragraphs: [
        "Finnish patenting is volatile precisely because it was concentrated: 2,011 in 2004 → 1,260 in 2016 (−37%), then an uneven recovery to 1,770 in 2024. The timing tracks Nokia with a lag — at its peak Nokia accounted for 43% of Finnish EPO applications and still 27% in 2011. The IMF documented grants contracting since 2007, deviating from the European trend.",
        "After 2013 the system de-concentrated: fewer patents per firm, spread across more firms — diversification, but no new large-scale patent generator. The 2025 rebound (EPO applications +44% to 3,457, the largest rise among EPO members) is striking but cautious reading is required: Nokia alone filed nearly two-thirds of Finnish applications. IQM Quantum Computers entering the top-10 applicants is diversification at the margin; the aggregate remains Nokia-dependent.",
      ],
      stats: [
        { label: "2004 → 2016", value: "−37%" },
        { label: "2024 residents", value: "1,770" },
        { label: "EPO 2025", value: "+44% → 3,457" },
        { label: "Nokia share of 2025", value: "≈ two-thirds" },
      ],
      source: "finland-analysis.md › 2.1 Patent Metrics",
    },
  },
  patents_nonresidents: {
    Italy: {
      verdict: "A thin foreign filing base",
      tone: "neutral",
      paragraphs: [
        "Non-resident filings sit in a narrow ~780–1,200 band across the whole period, with a mild recent uptick (1,145 in 2023, 1,188 in 2024) even as resident filings dipped. Foreign applicants are a small, stable minority of the national pipeline; the resident share stays around 88–93%.",
        "Data caution: the raw World Bank feed shows a 2015 spike of 9,687 that the analysis flags as a methodological outlier, not a real surge. The processed series used here replaces it with interior interpolation (877), and the point is marked as estimated on the chart.",
      ],
      stats: [
        { label: "Typical band", value: "~780–1,200" },
        { label: "2015 raw outlier", value: "9,687 (flagged)" },
        { label: "2024", value: "1,188" },
        { label: "Resident share", value: "≈ 88–93%" },
      ],
      source: "italy-analysis.md › 2.1 + Data Notes",
    },
    Finland: {
      verdict: "A vanishing foreign series",
      tone: "warning",
      paragraphs: [
        "Foreign filings at the Finnish office collapsed from 209 (2004) to 59 (2024–25). The resident share is now ≈97% — the mirror image of a system where the patent pipeline is dominated by domestic firms, above all Nokia.",
        "The analysis explicitly cautions that the exceptionally low 2024 figure (59) may reflect a reporting or methodological issue rather than a real collapse in foreign filings. Read the tail of this series as provisional; the 2025 value is carried forward and marked as extrapolated.",
      ],
      stats: [
        { label: "2004 → 2024", value: "209 → 59" },
        { label: "Resident share", value: "≈ 97%" },
        { label: "2024 caveat", value: "possible artefact" },
        { label: "2025", value: "extrapolated" },
      ],
      source: "finland-analysis.md › 2.1 + Data Notes",
    },
  },
  journal_articles: {
    Italy: {
      verdict: "The strongest metric",
      tone: "positive",
      paragraphs: [
        "Scientific output is Italy's unambiguous strength: 44,324 articles in 2004 → 82,771 in 2023 (+78%), with a pandemic peak of 85,700 in 2021. Three phases: rapid growth to 2013 (+~50%), flat 2014–2019 (debt crisis and university budget cuts), then pandemic growth and mild retrenchment.",
        "Quality reinforces volume: second in Europe by publication volume after Germany, roughly 3% of the world's most-cited output. The paradox lives here — the Ministry of University and Research itself acknowledges high scientific production without comparable patenting or economic returns. This is the clearest diagnostic of where the system fails: not knowledge creation, but translation.",
      ],
      stats: [
        { label: "2004 → 2023", value: "+78%" },
        { label: "Peak (2021)", value: "85,700" },
        { label: "World top-cited share", value: "≈ 3%" },
        { label: "Europe volume rank", value: "2nd" },
      ],
      source: "italy-analysis.md › 2.2 Scientific Journals",
    },
    Finland: {
      verdict: "Saturated excellence",
      tone: "positive",
      paragraphs: [
        "+28% over two decades (8,775 → 11,543 in 2022) — less than half of Italy's growth, but for the opposite reason: Finland entered the period with an already mature publication system operating near full potential. Italy was catching up from a lower base; Finland was maintaining a frontier.",
        "The level difference is decisive: roughly 1,300–1,500 publications per million inhabitants — about twice Italy's per-capita output, 6th globally in 2023 — with a high share of top-10%-cited papers and intensive international collaboration. The academic base did not collapse with Nokia. That is why the GII input–output gap is a commercialisation problem, not a science-quality problem.",
      ],
      stats: [
        { label: "2004 → 2022", value: "+28%" },
        { label: "Per-capita vs Italy", value: "≈ 2×" },
        { label: "Per-capita rank (2023)", value: "6th globally" },
        { label: "Role in system", value: "stable input" },
      ],
      source: "finland-analysis.md › 2.2 Scientific Journals",
    },
  },
  rd_pct_gdp: {
    Italy: {
      verdict: "Gradual, structurally low",
      tone: "warning",
      paragraphs: [
        "R&D intensity rose from 1.05% to ~1.39% of GDP (+32% relative over twenty years), fastest in 2010–2020 under Horizon 2020. The apparent post-pandemic dip is a denominator effect: GDP grew faster than R&D spending. Italy remains far below the EU average (2.14%) and the 3% target; over the past decade GERD/GDP grew by just 0.04pp.",
        "The structural problem is business R&D: 0.76% of GDP against an EU average of 1.49%, with 73.1% of it concentrated in large firms. Only one in ten Italian SMEs records R&D spending, and that share fell 11% between 2020 and 2024. Universities and government carry a disproportionate burden — which is exactly why article counts grow while patents don't follow.",
      ],
      stats: [
        { label: "2025 intensity", value: "1.39%" },
        { label: "Business R&D", value: "0.76% GDP" },
        { label: "Large-firm share", value: "73.1%" },
        { label: "EU average", value: "2.14%" },
      ],
      source: "italy-analysis.md › 2.3 R&D Expenditure",
    },
    Finland: {
      verdict: "High, but structurally wounded",
      tone: "warning",
      paragraphs: [
        "At 3.19% of GDP (2025) Finland spends more than twice Italy's intensity and ranks 9th globally — but the aggregate hides a violent adjustment. R&D peaked at 3.73% in 2009 and plunged to 2.75% by 2016: roughly a full percentage point of GDP in seven years. Nokia was 37% of gross domestic R&D in 2008 and nearly half of business R&D at its peak; business R&D fell ~30% from 2009, and collaborative innovation funding was withdrawn quickly.",
        "The recovery is real but partial and more versatile: pharma R&D +31% and ICT R&D +54% between 2009 and 2016 even as electronics collapsed. Yet business and government R&D remain ~20% and ~28% below their 2009 levels. The high ratio is sustained partly by public spending and a smaller, diversified private sector — not a return to the pre-2013 corporate R&D base.",
      ],
      stats: [
        { label: "2025 intensity", value: "3.19%" },
        { label: "2009 → 2016", value: "≈ −1pp GDP" },
        { label: "Nokia share of GERD '08", value: "37%" },
        { label: "Business R&D vs 2009", value: "≈ −20%" },
      ],
      source: "finland-analysis.md › 2.3 R&D Expenditure",
    },
  },
  hitech_exports_usd: {
    Italy: {
      verdict: "A late, narrow surge",
      tone: "positive",
      paragraphs: [
        "Stall, stability, then acceleration: $27.8B in 2007, debt-crisis dip, modest recovery to $32.9B by 2014 — then an explosion from $32.9B (2020) to $52.2B (2023), +53% in three years, reaching $60.2B in 2024. The high-tech share of manufactured exports rose from 6.7% to 12.3%, confirming a real compositional shift, not just prices.",
        "Two drivers: pharmaceutical and medical-technology exports (a long-standing Italian advantage amplified by pandemic demand and reshoring), and the delayed commercialisation of 2010–2015 inventions — a 7–12 year invention-to-revenue lag that Italy's weak translation infrastructure stretches further. The surge is real but fragile: concentrated in a few sectors and dependent on a prior investment cycle rather than a continuously replenishing patent pipeline.",
      ],
      stats: [
        { label: "2024", value: "$60.2B" },
        { label: "2020 → 2023", value: "+53%" },
        { label: "Commercialisation lag", value: "7–12 yrs" },
        { label: "Mfg. share 2024", value: "12.3%" },
      ],
      source: "italy-analysis.md › 2.4 High-Tech Exports",
    },
    Finland: {
      verdict: "The 72% collapse",
      tone: "negative",
      paragraphs: [
        "This is where the Nokia shock is most visible: $16.9B (2008) → $4.7B (2013), a 72% decline in five years. Mobile handsets alone fell from 13% of Finnish goods exports in 2000 to 1% in 2013. The European Commission estimated the handset collapse accounted for around half of Finland's total export-market-share loss; Nokia had directly generated 3–4% of GDP, >20% of exports and ~23% of corporate tax (2003).",
        "The recovery is partial: $5.3B in 2023, ~$4.9B in 2024–25, with composition shifting toward pharmaceuticals, ICT and defence/dual-use technologies. None has reached handset-era export scale. The series confirms the national diagnosis: Finland diversified away from Nokia without replacing Nokia's scale — and in the VIF models this target's 2009 crash (−48% in one year) is the structural break that flips Finland's conditional GDP coefficient negative.",
      ],
      stats: [
        { label: "2008 → 2013", value: "−72%" },
        { label: "2025", value: "$4.9B" },
        { label: "Handsets, goods exports", value: "13% → 1%" },
        { label: "Nokia share of exports", value: "> 20%" },
      ],
      source: "finland-analysis.md › 2.4 High-Tech Exports",
    },
  },
  hitech_pct_manufactured: {
    Italy: {
      verdict: "Composition finally shifting",
      tone: "positive",
      paragraphs: [
        "The share of high-tech products in manufactured exports climbed from 6.7% (2007) to 10.1% (2023) and 12.3% (2024). Because this ratio strips out price and exchange-rate noise, it confirms the 2020–2024 export surge reflects a genuine compositional shift toward high-tech sectors — pharma, medtech, defence and advanced manufacturing.",
        "Modelling note: this variable is deliberately excluded from the export regressions. Its numerator is the target itself (hi-tech exports ÷ manufactured exports), so regressing exports on it is a mathematical identity. An early iteration included it and produced spuriously 'significant' coefficients — the revised VIF pool never uses it.",
      ],
      stats: [
        { label: "2007 → 2024", value: "6.7% → 12.3%" },
        { label: "2024", value: "12.3%" },
        { label: "Role in export models", value: "excluded (identity)" },
        { label: "Role in GII model", value: "retained, n.s." },
      ],
      source:
        "italy-analysis.md › 2.4 + 01_vif_regression_analysis.md › Step 3",
    },
    Finland: {
      verdict: "From 20%+ to ~9%",
      tone: "negative",
      paragraphs: [
        "The share series tells the collapse story in real terms: ~22% of manufactured exports in the mid-2000s → 9.0% by 2013, stabilising around 9–10% since. The nominal-dollar crash was partly prices; this ratio confirms a real compositional collapse from the Nokia-era 20%+ structure.",
        "A decade later the share has not recovered — Finland's export basket diversified (pharma, ICT, defence/dual-use) but nothing reproduces the handset-era concentration of high-tech value. Like Italy, this variable is excluded from the export models as tautological; it enters the GII model only with an explicit partial-tautology flag.",
      ],
      stats: [
        { label: "Mid-2000s → 2025", value: "≈22% → 9.2%" },
        { label: "Trough (2013)", value: "9.0%" },
        { label: "Post-2016 band", value: "9–10%" },
        { label: "Role in export models", value: "excluded (identity)" },
      ],
      source:
        "finland-analysis.md › 2.4 + 01_vif_regression_analysis.md › Step 3",
    },
  },
  gini_index: {
    Italy: {
      verdict: "Inequality as a diffusion brake",
      tone: "negative",
      paragraphs: [
        "Remarkably stable — 34.3 in 2004, 33.7 in 2025 — but stability at a high level masks three phases: crisis-era increase (2007–2012, austerity hitting the poor), peak inequality (2013–2017, widening North–South gap), and a fragile improvement (2018–2022) driven by pandemic supports that reversed once withdrawn.",
        "The innovation link is indirect but powerful: R&D, patents and quality innovation are overwhelmingly concentrated in the Centre-North — the Bank of Italy finds innovation 'increasingly dominated by incumbent firms' with quality peaks in the Centre-North. Absorptive capacity is unevenly distributed, so doubling high-tech exports did not move the Gini: the gains were regionally and sectorally concentrated. Without southern absorptive capacity, aggregate R&D growth widens rather than narrows the innovation divide.",
      ],
      stats: [
        { label: "2025", value: "33.7" },
        { label: "22-year range", value: "32.9–35.9" },
        { label: "Spatial pattern", value: "Centre-North core" },
        { label: "VIF model result", value: "n.s. (p = 0.46)" },
      ],
      source: "italy-analysis.md › 2.5 Gini Index",
    },
    Finland: {
      verdict: "Inclusive base, thin top",
      tone: "positive",
      paragraphs: [
        "One of the lowest Gini coefficients in the world, moving in a narrow 26.8–28.3 band. Combined with high trust and strong institutions, low inequality supports the inputs to innovation — education, basic research, social stability — and relatively even regional development.",
        "But low inequality is an enabling condition, not a translation mechanism. The Finnish system is inclusive at the base and thin at the top: it produces highly educated people and strong science yet struggles to generate large R&D-intensive commercialisers. The GII asymmetry (inputs 5th, outputs 10th) is the quantitative expression of that. Caution: the VIF export model's 'significant positive' Gini coefficient is a shared-trend artefact over a ±1.5-point range — not a policy lever.",
      ],
      stats: [
        { label: "2025", value: "27.6" },
        { label: "22-year range", value: "26.8–28.3" },
        { label: "GII in / out rank", value: "5th / 10th" },
        { label: "VIF coefficient", value: "trend artefact" },
      ],
      source: "finland-analysis.md › 2.5 + 01_vif_regression_analysis.md",
    },
  },
  gdp_ppp_percapita: {
    Italy: {
      verdict: "Growth without an innovation dividend",
      tone: "warning",
      paragraphs: [
        "Roughly a doubling: $29,581 (2004) → $62,803 (2025). But the path splits into a genuine +20% before the crisis (2004–2008), a seven-year stall around $34–37k (2009–2015), and a near-50% jump after 2016 of which a significant part is inflation rather than productivity. The 2021–2023 hi-tech export burst helped; GII and patenting did not improve proportionally.",
        "Tellingly, R&D expenditure kept rising through the stall — public research is relatively insulated from the business cycle while private innovation investment is procyclical and constrained. In the VIF log model, GDP per capita is Italy's only significant predictor: +2.7% hi-tech exports per additional $1,000 of PPP income (p < 0.001, HC3). Development level, not innovation inputs, carries the association.",
      ],
      stats: [
        { label: "2004 → 2025", value: "×2.1" },
        { label: "Stall", value: "2009–2015" },
        { label: "VIF effect", value: "+2.7% / +$1,000" },
        { label: "VIF significance", value: "p < 0.001" },
      ],
      source: "italy-analysis.md › 2.7 + 01_vif_regression_analysis.md › Italy",
    },
    Finland: {
      verdict: "A lost decade, then recovery",
      tone: "warning",
      paragraphs: [
        "$31,195 (2004) → $65,885 (2025), with a Nokia-prolonged stagnation in between: $37,988 in 2009 and only $42,258 in 2015 — barely +11% in six years. The post-2016 acceleration reflects diversification, services and startup scaling (plus inflation), not a restored corporate R&D engine: R&D intensity fell while income stagnated, then recovered only partially while income accelerated.",
        "In the VIF log model Finland's conditional GDP coefficient is negative (−1.7% exports per +$1,000, p < 0.001). This is not 'income reduces exports': with patents and R&D controlled, residual GDP variation captures the business cycle — above all 2009, when exports crashed 48% while PPP income kept rising. The unconditional relationship is positive; the sign flip is a structural-break artefact and is flagged as such throughout the analysis.",
      ],
      stats: [
        { label: "2004 → 2025", value: "×2.1" },
        { label: "2009 → 2015", value: "+11%" },
        { label: "VIF effect (conditional)", value: "−1.7% / +$1,000" },
        { label: "Reading", value: "cycle artefact" },
      ],
      source:
        "finland-analysis.md › 2.7 + 01_vif_regression_analysis.md › Finland",
    },
  },
  gov_debt_pct_gdp: {
    Italy: {
      verdict: "The binding fiscal constraint",
      tone: "negative",
      paragraphs: [
        "Above 100% of GDP for the entire period — second-highest in the euro area after Greece. Three phases: rapid rise from 103.5% (2007) to 134.8% (2014); an austerity plateau around 134%; a pandemic jump to 154.4% in 2020, the largest single-year increase in Italian history. The decline to ~134% by 2023 is largely an inflation artefact: nominal GDP grew, the real burden did not shrink.",
        "The innovation consequence is direct: debt service and consolidation crowd out public R&D and university budgets. Italian public support for innovation is 'less complete and less generous' than EU partners, and the burden shifts to the industrial North and EU framework programmes — where Italy's success rate (~7.5% vs a 13% average) is below par. Debt is not background macro noise; it actively shapes who can afford to innovate.",
      ],
      stats: [
        { label: "2025", value: "137.1% GDP" },
        { label: "Pandemic peak (2020)", value: "154.4%" },
        { label: "Horizon success rate", value: "≈7.5% vs 13%" },
        { label: "VIF model result", value: "n.s. (p = 0.22)" },
      ],
      source: "italy-analysis.md › 2.6 + 3.4",
    },
    Finland: {
      verdict: "A narrowing corridor",
      tone: "warning",
      paragraphs: [
        "From 32.6% of GDP (2008) to 86.8% (2025), with IMF/EC projections approaching 89–91% in 2026. The rise tracks the double shock of the financial crisis and Nokia's collapse, a pre-pandemic plateau at 65–68%, then steady post-2020 climbing. Finland retains a high credit rating and manageable debt service — this is not the Italian trap.",
        "But the direction of travel matters for innovation policy: the post-Nokia R&D recovery has been partly publicly financed, and a rising debt ratio narrows the fiscal space for public R&D, universities and agencies like Business Finland. If consolidation bites, the public component of the innovation system could be the next casualty — pushing the system toward private scale-up, precisely its weakest dimension. VIF dropped debt for collinearity in Finland; the GII model retains it, non-significant.",
      ],
      stats: [
        { label: "2008 → 2025", value: "32.6% → 86.8%" },
        { label: "2026 projection", value: "≈ 89–91%" },
        { label: "Constraint status", value: "narrowing, not binding" },
        { label: "VIF model result", value: "dropped (VIF 13.4)" },
      ],
      source: "finland-analysis.md › 2.6 + 3.4",
    },
  },
  population: {
    Italy: {
      verdict: "Context, not a driver",
      tone: "neutral",
      paragraphs: [
        "Italy's population peaked around 60.3M in 2014 and has gently declined to 58.9M by 2025. There is no dedicated innovation narrative for this series — its analytical role is as the denominator behind per-capita normalisations (patents per million, articles per million, hi-tech exports per person), which is where the Italy–Finland comparison becomes fair.",
        "It is deliberately excluded from the VIF candidate pool: nearly flat within the sample, collinear with patent counts and GDP per capita, and carrying almost no information for explaining export movements. Keeping it would add noise, not signal.",
      ],
      stats: [
        { label: "2025", value: "58.9M" },
        { label: "Peak (2014)", value: "60.3M" },
        { label: "Analytical role", value: "normalisation" },
        { label: "VIF pool", value: "excluded (weak prior)" },
      ],
      source: "01_vif_regression_analysis.md › Step 3",
    },
    Finland: {
      verdict: "Context, not a driver",
      tone: "neutral",
      paragraphs: [
        "Steady growth from 5.23M (2004) to 5.65M (2025), about +8%. Like Italy, this series is infrastructure rather than story: it powers the per-capita views that reveal Finland's true scale — roughly twice Italy's articles per million, and the hi-tech export gap in per-person terms far smaller than the raw-dollar gap.",
        "Excluded from the VIF pool for the same reasons: within-country flatness, collinearity, and a weak prior. The dashboard's per-capita and index modes on every count metric exist precisely because absolute Italy–Finland comparisons are misleading without this denominator.",
      ],
      stats: [
        { label: "2025", value: "5.65M" },
        { label: "2004 → 2025", value: "+8%" },
        { label: "Analytical role", value: "normalisation" },
        { label: "VIF pool", value: "excluded (weak prior)" },
      ],
      source: "01_vif_regression_analysis.md › Step 3",
    },
  },
  gii_score: {
    Italy: {
      verdict: "A decade of relative decline",
      tone: "negative",
      paragraphs: [
        "The score rose from 40.69 (2011) to a 47.85 peak (2013), then drifted down to 44.90 (2025); the rank slipped from 26th (2023–24) to 28th of 139. The input–output asymmetry is diagnostic: outputs rank 19th against inputs 37th — Italy converts modest inputs relatively efficiently, the inverse of Finland's profile.",
        "The decline is not collapsing science. It is stagnating inputs — business R&D at 0.76% of GDP, venture capital at 0.03% of GDP (half the EU average) — plus an unchanged translation bottleneck: understaffed TTOs (5.7 FTE vs 11 EU average) and public spin-off creation falling from 162 (2018) to 86 (2023). The dedicated GII regression finds no significant linear driver at N=15; the bottleneck is structural, not a single lever.",
      ],
      stats: [
        { label: "2025 score / rank", value: "44.9 · 28th" },
        { label: "Input / output rank", value: "37th / 19th" },
        { label: "VC investment", value: "0.03% GDP" },
        { label: "Spin-offs 2018 → 2023", value: "162 → 86" },
      ],
      source: "italy-analysis.md › 2.8 + 3.1",
    },
    Finland: {
      verdict: "World-class inputs, second-tier outputs",
      tone: "warning",
      paragraphs: [
        "7th of 139 in 2025 (score 57.7), with inputs 5th and outputs 10th — and the conversion gap has widened: the output rank slipped 8th (2020) → 10th (2025) while inputs improved 8th → 5th. The long-run score path peaks at 61.8 (2012), troughs at 56.9 (2022), and recovers only partially.",
        "The mechanisms: a follow-on financing gap (≈70% of 2024 venture investment originated abroad), university–industry collaboration below OECD peers, a thin layer of large R&D-intensive firms, and deep-tech specialisations (quantum, AI, defence) whose commercialisation lags mean today's inputs become tomorrow's outputs. The startup ecosystem — 4,200 companies, 15 unicorns, record 2025 funding — is vibrant but not yet scaled. Finland's problem is conversion, not conditions.",
      ],
      stats: [
        { label: "2025 score / rank", value: "57.7 · 7th" },
        { label: "Input / output rank", value: "5th / 10th" },
        { label: "2024 VC foreign share", value: "≈ 70%" },
        { label: "Startup ecosystem", value: "4,200 · 15 unicorns" },
      ],
      source: "finland-analysis.md › 2.8 + 3.3",
    },
  },
};
