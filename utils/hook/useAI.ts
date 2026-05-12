import { useCallback, useState } from "react";

function stripCodeFence(text: string): string {
  const t = text.trim();
  const m = t.match(/^```(?:\w+)?\s*\n?([\s\S]*?)\n?```$/);
  return m ? m[1].trim() : t;
}

export type ChatErrorKind = "server" | "client" | "network";

export type ChatItem =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; error?: ChatErrorKind };

type ApiMsg = { role: "system" | "user" | "assistant"; content: string };

export default function useAI() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearContent = useCallback(() => {
    setItems([]);
  }, []);

  const sendMessage = useCallback(
    async (systemPrompt: string, userContent: string) => {
      const trimmed = userContent.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);

      const threadBeforeAssistant: ChatItem[] = [...items, { role: "user", content: trimmed }];
      const pendingAssistant: ChatItem = { role: "assistant", content: "" };
      setItems([...threadBeforeAssistant, pendingAssistant]);

      const apiMessages: ApiMsg[] = [
        { role: "system", content: systemPrompt },
        ...threadBeforeAssistant.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      try {
        const response = await fetch("/api/suggestion", {
          method: "POST",
          body: JSON.stringify({ messages: apiMessages, stream: true }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          const err = new Error(errText || `Request failed: ${response.status}`) as Error & { status: number };
          err.status = response.status;
          throw err;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          const raw = await response.text();
          const finalText = stripCodeFence(raw);
          setItems((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: finalText };
            return next;
          });
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setItems((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: accumulated };
            return next;
          });
        }
        accumulated += decoder.decode();
        const finalText = stripCodeFence(accumulated.trimEnd());
        setItems((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: finalText };
          return next;
        });
      } catch (e) {
        let errorKind: ChatErrorKind = "network";
        if (e && typeof e === "object" && "status" in e) {
          const st = Number((e as { status: unknown }).status);
          if (!Number.isNaN(st)) {
            errorKind = st >= 500 ? "server" : "client";
          }
        }
        setItems((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role !== "assistant") return prev;
          next[next.length - 1] = { role: "assistant", content: "", error: errorKind };
          return next;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [items, isLoading]
  );

  return { items, sendMessage, isLoading, clearContent };
}
