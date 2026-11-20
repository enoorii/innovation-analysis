import { ChatDock } from "@/chat/chat-dock";
import { useChatDock } from "@/chat/use-chat-dock";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GROUP_LABEL,
  METRICS,
  METRIC_BY_SLUG,
  type MetricGroup,
} from "@/data/metrics";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Menu,
  Moon,
  ScrollText,
  Sigma,
  Sparkles,
  Sun,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width="30"
        height="30"
        viewBox="0 0 64 64"
        aria-hidden
        className="shrink-0"
      >
        <rect width="64" height="64" rx="14" fill="var(--muted)" />
        <polyline
          points="8,44 20,30 30,38 42,18 56,26"
          fill="none"
          stroke="var(--italy)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="8,52 22,46 34,50 46,34 56,40"
          fill="none"
          stroke="var(--finland)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="18" r="4.5" fill="var(--gold)" />
      </svg>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">
          Innovation Atlas
        </span>
        <span className="block text-[10px] text-muted-foreground">
          Italy × Finland · 2004–2025
        </span>
      </span>
    </span>
  );
}

const ANALYSES = [
  { to: "/analysis/vif", label: "VIF regression", icon: Sigma },
  { to: "/analysis/dlm", label: "Distributed lag", icon: Timer },
  { to: "/analysis/gii", label: "GII drivers", icon: Sparkles },
];

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
    isActive
      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
  );
}

function ActiveBar({ isActive }: { isActive: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-finland transition-opacity",
        isActive ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const groups: MetricGroup[] = ["outputs", "inputs", "economy"];
  return (
    <nav
      className="flex-1 space-y-5 overflow-y-auto px-4 py-4"
      aria-label="Dashboard"
    >
      <NavLink to="/" end className={navClass} onClick={onNavigate}>
        {({ isActive }) => (
          <>
            <ActiveBar isActive={isActive} />
            <TrendingUp className="size-4" aria-hidden />
            Overview
          </>
        )}
      </NavLink>

      {groups.map((g) => (
        <div key={g}>
          <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {GROUP_LABEL[g]}
          </div>
          <div className="space-y-0.5">
            {METRICS.filter((m) => m.group === g).map((m) => (
              <NavLink
                key={m.slug}
                to={`/metrics/${m.slug}`}
                className={navClass}
                onClick={onNavigate}
              >
                {({ isActive }) => (
                  <>
                    <ActiveBar isActive={isActive} />
                    <m.icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{m.short}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Statistical analyses
        </div>
        <div className="space-y-0.5">
          {ANALYSES.map((a) => (
            <NavLink
              key={a.to}
              to={a.to}
              className={navClass}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <ActiveBar isActive={isActive} />
                  <a.icon className="size-4" aria-hidden />
                  {a.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <NavLink to="/methodology" className={navClass} onClick={onNavigate}>
        {({ isActive }) => (
          <>
            <ActiveBar isActive={isActive} />
            <BookOpen className="size-4" aria-hidden />
            Methodology
          </>
        )}
      </NavLink>
    </nav>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme === "dark";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle color theme"
            onClick={() => setTheme(dark ? "light" : "dark")}
          />
        }
      >
        {mounted && dark ? (
          <Sun className="size-4" aria-hidden />
        ) : (
          <Moon className="size-4" aria-hidden />
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom">Toggle theme</TooltipContent>
    </Tooltip>
  );
}

function breadcrumb(pathname: string): string {
  if (pathname === "/") return "Overview";
  if (pathname.startsWith("/metrics/")) {
    const slug = pathname.split("/")[2];
    const m = METRIC_BY_SLUG[slug];
    return m ? `Indicators · ${m.short}` : "Indicators";
  }
  if (pathname === "/analysis/vif") return "Analyses · VIF regression";
  if (pathname === "/analysis/dlm") return "Analyses · Distributed lag";
  if (pathname === "/analysis/gii") return "Analyses · GII drivers";
  if (pathname === "/methodology") return "Methodology";
  return "Innovation Atlas";
}

export function AppShell() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { openChat } = useChatDock();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <div className="scene" aria-hidden />
      <div className="grain" aria-hidden />

      {/* Fixed desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-sidebar-border bg-sidebar/90 backdrop-blur lg:flex">
        <div className="px-5 pb-3 pt-5">
          <NavLink to="/" aria-label="Innovation Atlas home">
            <Logo />
          </NavLink>
        </div>
        <Separator />
        <SidebarNav />
        <div className="border-t border-sidebar-border px-5 py-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ScrollText className="size-3" aria-hidden />
            Descriptive associations — not causal estimates
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <Sheet
        open={navOpen}
        onClose={() => setNavOpen(false)}
        side="left"
        label="Navigation"
        widthClass="w-[290px]"
      >
        <div className="px-5 pb-3 pt-5">
          <Logo />
        </div>
        <Separator />
        <SidebarNav onNavigate={() => setNavOpen(false)} />
      </Sheet>

      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur lg:pl-[268px]">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <div className="min-w-0 truncate text-sm text-muted-foreground">
            {breadcrumb(location.pathname)}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button size="sm" onClick={() => openChat()}>
              <Sparkles className="size-4" aria-hidden />
              <span className="hidden sm:inline">Ask the analyst</span>
              <span className="sm:hidden">Ask</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="lg:pl-[268px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6">
          <Outlet />
          <footer className="mt-14 border-t border-border pt-5 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              Sources: World Bank WDI · IMF WEO (debt) · WIPO GII 2025 · EPO
              Patent Index · ISTAT / Statistics Finland · OECD & European
              Commission country reports. Processed 19 Nov 2026 · 22 annual
              observations per country.
            </p>
            <p className="mt-1">
              All regressions are descriptive associations on small samples — no
              causal claims. HC3 robust errors are authoritative where reported.
            </p>
          </footer>
        </div>
      </main>

      <ChatDock />
    </div>
  );
}
