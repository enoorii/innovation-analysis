import { cn } from "@/lib/utils";
import { createContext, useContext, type ReactNode } from "react";

const TabsCtx = createContext<{
  value: string;
  onChange: (v: string) => void;
} | null>(null);

export function Tabs({
  value,
  onChange,
  className,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <TabsCtx.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsCtx);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsCtx);
  if (!ctx || ctx.value !== value) return null;
  return <div className={cn("rise", className)}>{children}</div>;
}
