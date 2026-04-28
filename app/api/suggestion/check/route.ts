import { NextResponse } from "next/server";

import { requirePasswordAuth } from "@/utils/passwordServer";

export async function GET(request: Request) {
  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const hasAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);

  return NextResponse.json({ hasAI });
}
