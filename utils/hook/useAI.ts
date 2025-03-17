import { useState } from "react";

export default function useAI() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pushMessage = async (messages: { role: string; content: string }[]) => {
    setIsLoading(true);
    const response = await fetch("/api/suggestion", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });

    setContent(
      await response.text().then((text) => {
        return text.replace("```json", "").replace("```", "");
      })
    );
    setIsLoading(false);
  };

  return { content, pushMessage, isLoading };
}
