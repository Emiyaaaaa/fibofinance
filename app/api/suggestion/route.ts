import OpenAI from "openai";

export async function POST(req: Request) {
  const openai = new OpenAI({
    baseURL: process.env.ARK_BASE_URL,
    apiKey: process.env.ARK_API_KEY,
  });

  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "doubao-1-5-lite-32k-250115",
    messages,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || "";

        if (text) {
          const encoder = new TextEncoder();

          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
