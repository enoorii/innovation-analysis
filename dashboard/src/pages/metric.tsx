import { useChatDock } from "@/chat/use-chat-dock";
import { CountryTag, SourceLine, TONE_CLASS } from "@/components/atoms";
import { MetricExplorer } from "@/components/charts/metric-explorer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { eventById } from "@/data/events";
import { GROUP_LABEL, METRIC_BY_SLUG, metricNeighbors } from "@/data/metrics";
import type { Country } from "@/data/series";
import type { Take } from "@/data/takes";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sigma, Sparkles } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import NotFoundPage from "./not-found";

function TakeCard({ country, take }: { country: Country; take: Take }) {
  return (
    <Card
      className={cn(
        country === "Italy" ? "border-italy/30" : "border-finland/30",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CountryTag country={country} />
          <Badge variant="outline" className={TONE_CLASS[take.tone]}>
            {take.verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose-take text-sm leading-relaxed text-muted-foreground">
          {take.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {take.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-muted/40 px-2.5 py-2"
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className="text-sm font-semibold tabular">{s.value}</div>
            </div>
          ))}
        </div>
        <SourceLine>{take.source}</SourceLine>
      </CardContent>
    </Card>
  );
}

export default function MetricPage() {
  const { metricId } = useParams();
  const location = useLocation();
  const { openChat } = useChatDock();
  const def = metricId ? METRIC_BY_SLUG[metricId] : undefined;
  if (!def) return <NotFoundPage />;

  const state = location.state as { eventId?: string } | null;
  const focusEvent = state?.eventId ? eventById(state.eventId) : undefined;
  const { prev, next } = metricNeighbors(def.slug);

  return (
    <div className="space-y-8">
      <header className="rise space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {GROUP_LABEL[def.group]}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
              <def.icon className="size-5 text-finland" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {def.label}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {def.wb}
                </Badge>
                <span>{def.unit}</span>
                <span>· Italy × Finland, 2004–2025</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              openChat(
                `Summarize the ${def.short} story for Italy vs Finland, with the key caveats.`,
              )
            }
          >
            <Sparkles className="size-4 text-gold" aria-hidden /> Ask about this
            indicator
          </Button>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {def.blurb}
        </p>
      </header>

      <MetricExplorer
        key={`${def.id}-${focusEvent?.id ?? "full"}`}
        metric={def}
        focusEvent={focusEvent}
      />

      {/* Role in the models */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sigma className="size-4 text-violet" aria-hidden /> In the
          statistical models
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(["Italy", "Finland"] as Country[]).map((c) => (
            <Card key={c}>
              <CardContent className="py-3.5">
                <CountryTag country={c} className="mb-1.5 text-xs" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {def.modelNotes[c]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Two-column takes (stack on mobile) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Our analysis take</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TakeCard country="Italy" take={def.takeItaly} />
          <TakeCard country="Finland" take={def.takeFinland} />
        </div>
      </section>

      {/* Prev / next */}
      <nav
        className="flex items-stretch justify-between gap-3 border-t border-border pt-5"
        aria-label="Indicator navigation"
      >
        {prev ? (
          <Link
            to={`/metrics/${prev.slug}`}
            className="group flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/70 px-3.5 py-2.5 text-sm transition-colors hover:border-ring"
          >
            <ChevronLeft
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-[10px] text-muted-foreground">
                Previous
              </span>
              <span className="block truncate font-medium">{prev.short}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/metrics/${next.slug}`}
            className="group flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/70 px-3.5 py-2.5 text-right text-sm transition-colors hover:border-ring"
          >
            <span className="min-w-0">
              <span className="block text-[10px] text-muted-foreground">
                Next
              </span>
              <span className="block truncate font-medium">{next.short}</span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
