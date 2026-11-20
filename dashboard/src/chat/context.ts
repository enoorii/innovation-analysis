import { createContext } from "react";

export interface ChatDockContextValue {
  open: boolean;
  prefill: string;
  openChat: (question?: string) => void;
  closeChat: () => void;
  consumePrefill: () => void;
}

export const ChatDockContext = createContext<ChatDockContextValue | null>(null);
