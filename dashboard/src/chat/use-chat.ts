import { apiUrl } from "@/lib/api";
import { uid } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SourceRef {
  source: string;
  score: number;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  streaming?: boolean;
  stopped?: boolean;
  error?: string;
}

export type CountryFilter = "both" | "Italy" | "Finland";
export type AnalysisFilter = "all" | "vif" | "dlm" | "gii" | "data";

const SESSION_KEY = "innovation-atlas.session";

function loadSession(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = uid();
    localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return uid();
  }
}

interface HistoryResponse {
  session_id: string;
  messages: { role: string; content: string }[];
}

/**
 * Chat state against the FastAPI backend:
 * - persistent session_id (localStorage) → backend memory
 * - history rehydration via GET /chat/{id}
 * - AI SDK Data Stream v1 parsing over fetch (0: text, 2: data, 3: error, d: finish)
 * - reset = DELETE /chat/{id} + fresh UUID on both sides
 */
export function useChat(open: boolean) {
  const [sessionId, setSessionId] = useState<string>(loadSession);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  const [country, setCountry] = useState<CountryFilter>("both");
  const [analysis, setAnalysis] = useState<AnalysisFilter>("all");
  const abortRef = useRef<AbortController | null>(null);
  const loadedForRef = useRef<string | null>(null);

  const health = useQuery({
    queryKey: ["backend-health"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/health"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as { status: string };
    },
    enabled: open,
    retry: 1,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!open || loadedForRef.current === sessionId) return;
    loadedForRef.current = sessionId;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/chat/${sessionId}`));
        if (!res.ok) return;
        const data = (await res.json()) as HistoryResponse;
        if (cancelled) return;
        const mapped: ChatMsg[] = data.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: uid(),
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
        setMessages((prev) => (prev.length === 0 ? mapped : prev));
      } catch {
        /* offline: start empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, sessionId]);

  const patch = useCallback((id: string, fn: (m: ChatMsg) => ChatMsg) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      const userMsg: ChatMsg = { id: uid(), role: "user", content: trimmed };
      const aid = uid();
      const assistant: ChatMsg = {
        id: aid,
        role: "assistant",
        content: "",
        streaming: true,
      };
      setMessages((prev) => [...prev, userMsg, assistant]);
      setSending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(apiUrl("/chat/stream"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            message: trimmed,
            country_filter: country === "both" ? null : country,
            analysis_filter: analysis,
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body)
          throw new Error(`Backend returned HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line || line.length < 2) continue;
            const code = line[0];
            const rest = line.slice(2);
            try {
              const parsed: unknown = JSON.parse(rest);
              if (code === "0" && typeof parsed === "string") {
                patch(aid, (m) => ({ ...m, content: m.content + parsed }));
              } else if (code === "2") {
                const items = Array.isArray(parsed) ? parsed : [parsed];
                for (const item of items) {
                  if (item && typeof item === "object" && "retrieved" in item) {
                    const retrieved = (item as { retrieved: SourceRef[] })
                      .retrieved;
                    if (Array.isArray(retrieved)) {
                      patch(aid, (m) => ({ ...m, sources: retrieved }));
                    }
                  }
                }
              } else if (code === "3") {
                patch(aid, (m) => ({ ...m, error: String(parsed) }));
              }
              // "d:" finish frame → handled by loop end / finally
            } catch {
              /* partial frame — ignore */
            }
          }
        }
      } catch (err) {
        const e = err as Error;
        if (e.name === "AbortError") {
          patch(aid, (m) => ({ ...m, stopped: true }));
        } else {
          patch(aid, (m) => ({
            ...m,
            error:
              e.message ||
              "Could not reach the backend. Is FastAPI running on 127.0.0.1:9123?",
          }));
        }
      } finally {
        patch(aid, (m) => ({ ...m, streaming: false }));
        setSending(false);
        abortRef.current = null;
      }
    },
    [sending, sessionId, country, analysis, patch],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(async () => {
    abortRef.current?.abort();
    try {
      await fetch(apiUrl(`/chat/${sessionId}`), { method: "DELETE" });
    } catch {
      /* backend offline — reset locally anyway */
    }
    const fresh = uid();
    try {
      localStorage.setItem(SESSION_KEY, fresh);
    } catch {
      /* private mode */
    }
    loadedForRef.current = fresh;
    setSessionId(fresh);
    setMessages([]);
    setSending(false);
  }, [sessionId]);

  return {
    sessionId,
    messages,
    sending,
    country,
    setCountry,
    analysis,
    setAnalysis,
    send,
    stop,
    reset,
    health,
  };
}
