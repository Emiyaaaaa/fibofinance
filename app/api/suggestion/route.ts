import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  const openai = new OpenAI({
    baseURL: process.env.ARK_BASE_URL,
    apiKey: process.env.ARK_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: "doubao-1-5-lite-32k-250115",
    messages: [
      { role: "user", content: "请帮我写一篇关于AI的文章，1000字左右" },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }

  return NextResponse.json({
    suggestion: "",
  });
}
