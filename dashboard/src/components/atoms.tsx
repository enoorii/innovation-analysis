import { Badge } from "@/components/ui/badge";
import type { Severity, ShockEvent } from "@/data/events";
import { SHORT_EVENT_LABEL } from "@/data/events";
import type { Country, Prov } from "@/data/series";
import type { TakeTone } from "@/data/takes";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import type { ReactNode } from "react";

export const COUNTRY_COLOR: Record<Country, string> = {
  Italy: "var(--italy)",
  Finland: "var(--finland)",
};

export function CountryDot({
  country,
  className,
}: {
  country: Country;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ background: COUNTRY_COLOR[country] }}
    />
  );
}

export function CountryTag({
  country,
  className,
}: {
  country: Country;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        className,
      )}
    >
      <CountryDot country={country} />
      {country}
    </span>
  );
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  high: "var(--rose)",
  medium: "var(--gold)",
  low: "var(--cyan)",
};

export function SeverityDot({
  severity,
  pulse,
}: {
  severity: Severity;
  pulse?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        pulse && "pulse-dot",
      )}
      style={{ background: SEVERITY_COLOR[severity] }}
    />
  );
}

const PROV_LABEL: Record<Exclude<Prov, "real">, string> = {
  interpolated: "interpolated",
  extrapolated_lead: "extrapolated",
  extrapolated_trail: "extrapolated",
  missing: "no data",
};

export function ProvBadge({
  prov,
  className,
}: {
  prov: Prov;
  className?: string;
}) {
  if (prov === "real") return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-gold/50 px-1.5 py-0 text-[10px] font-medium text-gold",
        prov === "missing" && "border-border text-muted-foreground",
        className,
      )}
    >
      {PROV_LABEL[prov]}
    </Badge>
  );
}

export const TONE_CLASS: Record<TakeTone, string> = {
  positive: "border-italy/50 text-italy",
  warning: "border-gold/50 text-gold",
  negative: "border-rose/50 text-rose",
  neutral: "border-border text-muted-foreground",
};

export function SectionTitle({
  eyebrow,
  title,
  lede,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {lede && (
        <p className="max-w-2xl text-sm text-muted-foreground">{lede}</p>
      )}
    </div>
  );
}

export function StatBox({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-foreground tabular">
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-muted-foreground tabular">{sub}</div>
      )}
    </div>
  );
}

export function SourceLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
      <FileText className="mt-0.5 size-3 shrink-0" aria-hidden />
      <span className="font-mono">{children}</span>
    </div>
  );
}

/** Compact event card used inside chart tooltips and hover popovers. */
export function EventNote({
  event,
  compact,
}: {
  event: ShockEvent;
  compact?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <SeverityDot severity={event.severity} />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-foreground">
          {compact ? (SHORT_EVENT_LABEL[event.id] ?? event.label) : event.label}
          <span className="ml-1.5 font-normal text-muted-foreground tabular">
            {event.start === event.end
              ? event.start
              : `${event.start}–${event.end}`}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {event.description}
        </p>
      </div>
    </div>
  );
}
