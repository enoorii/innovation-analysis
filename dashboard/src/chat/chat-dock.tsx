import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  RotateCcw,
  Send,
  Square,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChatDockContext } from "./context";
import { Markdown } from "./markdown";
import { useChat, type AnalysisFilter, type ChatMsg } from "./use-chat";
import { useChatDock } from "./use-chat-dock";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const openChat = useCallback((question?: string) => {
    if (question) setPrefill(question);
    setOpen(true);
  }, []);
  const closeChat = useCallback(() => setOpen(false), []);
  const consumePrefill = useCallback(() => setPrefill(""), []);
  const value = useMemo(
    () => ({ open, prefill, openChat, closeChat, consumePrefill }),
    [open, prefill, openChat, closeChat, consumePrefill],
  );
  return (
    <ChatDockContext.Provider value={value}>
      {children}
    </ChatDockContext.Provider>
  );
}

const SUGGESTIONS = [
  "Does R&D spending drive hi-tech exports in either country?",
  "Why is Finland's GDP-per-capita coefficient negative in the VIF model?",
  "What is the European paradox, Italian version?",
  "Why was hitech_pct_manufactured excluded from the export models?",
];

const ANALYSIS_LABEL: Record<AnalysisFilter, string> = {
  all: "All analyses",
  vif: "VIF regression",
  dlm: "Distributed lag",
  gii: "GII drivers",
  data: "Data prep",
};

function SourceList({ msg }: { msg: ChatMsg }) {
  if (!msg.sources || msg.sources.length === 0) return null;
  return (
    <details className="group mt-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
      <summary className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {msg.sources.length} retrieved source{msg.sources.length > 1 ? "s" : ""}
        <ChevronDown
          className="size-3 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-1.5 space-y-1.5">
        {msg.sources.map((s, i) => {
          const pct = Math.max(0, Math.min(1, s.score)) * 100;
          return (
            <div key={i} className="text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-foreground/80">
                  {s.source}
                </span>
                <span className="shrink-0 text-muted-foreground tabular">
                  {s.score.toFixed(2)}
                </span>
              </div>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-finland/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-finland/30 bg-finland/10 px-3.5 py-2 text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-italy/40 bg-italy/10">
        <Bot className="size-4 text-italy" aria-hidden />
      </div>
      <div className="min-w-0 max-w-[92%]">
        {msg.content ? (
          <Markdown text={msg.content} />
        ) : msg.streaming ? (
          <div className="space-y-2 py-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        ) : null}
        {msg.streaming && msg.content && (
          <span className="stream-caret" aria-hidden />
        )}
        {msg.stopped && (
          <div className="mt-1 text-[11px] text-muted-foreground">
            Generation stopped.
          </div>
        )}
        {msg.error && (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertTitle className="text-xs">Request failed</AlertTitle>
            <AlertDescription className="text-[11px]">
              {msg.error}
            </AlertDescription>
          </Alert>
        )}
        <SourceList msg={msg} />
      </div>
    </div>
  );
}

export function ChatDock() {
  const { open, openChat, closeChat, prefill, consumePrefill } = useChatDock();
  const chat = useChat(open);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && prefill) {
      setDraft(prefill);
      consumePrefill();
      setTimeout(() => textareaRef.current?.focus(), 260);
    }
  }, [open, prefill, consumePrefill]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [chat.messages, open]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const submit = () => {
    const text = draft;
    setDraft("");
    stickRef.current = true;
    void chat.send(text);
  };

  const status: "ok" | "loading" | "down" = chat.health.isLoading
    ? "loading"
    : chat.health.isError
      ? "down"
      : "ok";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => openChat()}
          className="glow-finland fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-finland/40 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xl transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
        >
          <Bot className="size-4" aria-hidden />
          Ask the analyst
        </button>
      )}

      <Sheet
        open={open}
        onClose={closeChat}
        side="right"
        label="AI analyst chat"
        widthClass="w-full sm:w-[460px]"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-italy/40 bg-italy/10">
                <Bot className="size-4.5 text-italy" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">The Analyst</div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status === "ok" && "bg-italy",
                      status === "loading" && "pulse-dot bg-gold",
                      status === "down" && "bg-rose",
                    )}
                    aria-hidden
                  />
                  {status === "ok"
                    ? "Connected"
                    : status === "loading"
                      ? "Checking…"
                      : "Backend offline"}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    nativeButton={false}
                    render={
                      <span className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground" />
                    }
                  >
                    {chat.sessionId.slice(0, 4)}
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-60 text-xs"
                  >
                    Session {chat.sessionId}. Persists across refreshes; Reset
                    clears backend memory and mints a new id.
                  </TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Reset chat session"
                      />
                    }
                  >
                    <RotateCcw className="size-4" aria-hidden />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Reset this conversation?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Clears the transcript here and the backend's session
                        memory (DELETE /chat/{chat.sessionId.slice(0, 8)}…),
                        then starts a fresh session id.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep chatting</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void chat.reset()}>
                        Reset session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close chat"
                  onClick={closeChat}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            {/* Retrieval filters */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Segmented
                size="xs"
                value={chat.country}
                onChange={chat.setCountry}
                ariaLabel="Country filter"
                options={[
                  { value: "both", label: "Both" },
                  { value: "Italy", label: "Italy" },
                  { value: "Finland", label: "Finland" },
                ]}
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                    />
                  }
                >
                  {ANALYSIS_LABEL[chat.analysis]}
                  <ChevronDown className="size-3" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(ANALYSIS_LABEL) as AnalysisFilter[]).map(
                    (k) => (
                      <DropdownMenuItem
                        key={k}
                        onClick={() => chat.setAnalysis(k)}
                      >
                        <Check
                          className={cn(
                            "size-3.5",
                            chat.analysis === k ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden
                        />
                        {ANALYSIS_LABEL[k]}
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-[10px] text-muted-foreground">
                retrieval scope
              </span>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {status === "down" && (
              <Alert className="border-gold/50 bg-gold/5 py-2.5">
                <AlertTitle className="text-xs text-gold">
                  Backend not reachable
                </AlertTitle>
                <AlertDescription className="text-[11px]">
                  Charts work offline; the chat needs FastAPI. Start it with{" "}
                  <code className="rounded bg-muted px-1 font-mono">
                    uv run poe dev
                  </code>{" "}
                  in{" "}
                  <code className="rounded bg-muted px-1 font-mono">
                    backend/
                  </code>{" "}
                  (port 9123).
                </AlertDescription>
              </Alert>
            )}
            {chat.messages.length === 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  I answer from the analysis notes and model outputs — Italy ×
                  Finland, 2004–2025 — and cite the source sections. Descriptive
                  associations, never causal claims. Try:
                </p>
                <div className="grid gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        stickRef.current = true;
                        void chat.send(q);
                      }}
                      className="group flex items-start justify-between gap-2 rounded-xl border border-border bg-card/80 px-3 py-2.5 text-left text-xs leading-snug transition-colors hover:border-ring"
                    >
                      {q}
                      <ArrowUpRight
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-finland"
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chat.messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Ask about the data, the models, the caveats…"
                rows={1}
                className="max-w-30 min-h-10.5 resize-none text-sm"
                aria-label="Chat message"
              />
              {chat.sending ? (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={chat.stop}
                  aria-label="Stop generation"
                >
                  <Square className="size-4" aria-hidden />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={submit}
                  disabled={!draft.trim()}
                  aria-label="Send message"
                >
                  <Send className="size-4" aria-hidden />
                </Button>
              )}
            </div>
            <div className="mt-1.5 text-[10px] text-muted-foreground">
              Enter ↵ to send · Shift+Enter for a new line · answers grounded in
              retrieved context
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
