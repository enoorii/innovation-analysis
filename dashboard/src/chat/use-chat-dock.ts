import { useContext } from "react";
import { ChatDockContext, type ChatDockContextValue } from "./context";

export function useChatDock(): ChatDockContextValue {
  const ctx = useContext(ChatDockContext);
  if (!ctx) throw new Error("useChatDock must be used inside <ChatProvider>");
  return ctx;
}
