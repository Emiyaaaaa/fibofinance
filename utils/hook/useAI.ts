import { useState } from "react";

export default function useAI() {
  const [content, setContent] = useState<string>("");

  const pushMessage = async (messages: { role: string; content: string }[]) => {
    const response = await fetch("/api/suggestion", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });

    setContent(await response.text());
  };

  return { content, pushMessage };
}
