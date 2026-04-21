import OpenAI from "openai";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
  });

  let body: { messages?: OpenAI.Chat.ChatCompletionMessageParam[]; stream?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { messages, stream } = body;
  if (!messages?.length) {
    return new Response("Missing messages", { status: 400 });
  }

  // `messages` must be a full chat including optional `system` followed by
  // alternating `user` / `assistant` turns (OpenAI chat completions format).

  if (stream) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (e) {
          controller.error(e);
          return;
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages,
  });

  const text = response.choices[0]?.message?.content ?? "";
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
