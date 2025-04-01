import { NextResponse } from "next/server";

export async function GET() {
  const hasAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);

  return NextResponse.json({ hasAI });
}
