import { useCallback, useState } from "react";

import { mdToHtml } from "../markdownit";

import { useSetInterval } from "@/utils/hook/useSetInterval";

let content = "";

export default function useStreamToHtml() {
  const [html, setHtml] = useState<string>("");

  const contentToHtml = useCallback(async () => {
    if (!content) return;

    const html = mdToHtml(content);

    setHtml(html);
  }, []);

  const { start, stop } = useSetInterval(contentToHtml, 500);

  const pushMessage = async (messages: { role: string; content: string }[]) => {
    content = "";
    setHtml("");

    const response = await fetch("/api/suggestion", {
      method: "POST",
      body: JSON.stringify({
        messages,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    start();

    while (true) {
      const { done, value } = (await reader?.read()) as {
        done: boolean;
        value: Uint8Array;
      };

      if (done) {
        stop();
        break;
      }

      const text = decoder.decode(value, { stream: true });

      content += text;
    }
  };

  return { html, pushMessage };
}
