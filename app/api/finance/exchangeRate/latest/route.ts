import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { DEFAULT_EXCHANGE_RATE } from "@/utils/exchangeRate";
import { requirePasswordAuth } from "@/utils/passwordServer";

const TABLE = "exchange_rate_data";

export async function GET(request: Request) {
  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const rows = await sql(`SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT 1`);
  return NextResponse.json(rows[0] ?? DEFAULT_EXCHANGE_RATE);
}
