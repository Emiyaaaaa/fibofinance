import { useState } from "react";

function stripCodeFence(text: string): string {
  const t = text.trim();
  const m = t.match(/^```(?:\w+)?\s*\n?([\s\S]*?)\n?```$/);
  return m ? m[1].trim() : t;
}

export default function useAI() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pushMessage = async (messages: { role: string; content: string }[]) => {
    setIsLoading(true);
    const response = await fetch("/api/suggestion", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });

    const raw = await response.text();
    setContent(stripCodeFence(raw));
    setIsLoading(false);
  };

  return { content, pushMessage, isLoading };
}
