import OpenAI from "openai";

export async function POST(req: Request) {
  const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { messages, stream } = await req.json();

  if (stream) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
      stream: true,
    });

    const readableStream = new ReadableStream({
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

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } else {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
    });

    return new Response(response.choices[0].message.content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
