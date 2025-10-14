import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { DEFAULT_EXCHANGE_RATE } from "@/utils/exchangeRate";

const TABLE = "exchange_rate_data";

export async function GET() {
  const rows = await sql(`SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT 1`);
  return NextResponse.json(rows[0] ?? DEFAULT_EXCHANGE_RATE);
}
