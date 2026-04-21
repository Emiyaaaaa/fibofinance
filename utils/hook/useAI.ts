import { useCallback, useState } from "react";

function stripCodeFence(text: string): string {
  const t = text.trim();
  const m = t.match(/^```(?:\w+)?\s*\n?([\s\S]*?)\n?```$/);
  return m ? m[1].trim() : t;
}

export type ChatItem = { role: "user" | "assistant"; content: string };

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
      setItems([...threadBeforeAssistant, { role: "assistant", content: "" }]);

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
          throw new Error(errText || `Request failed: ${response.status}`);
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
      } catch {
        setItems((prev) => (prev.length >= 2 ? prev.slice(0, -2) : []));
      } finally {
        setIsLoading(false);
      }
    },
    [items, isLoading]
  );

  return { items, sendMessage, isLoading, clearContent };
}
