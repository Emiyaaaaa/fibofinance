import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";

export async function GET() {
  const rows = await sql(
    "SELECT * FROM finance_change_data ORDER BY created_at DESC"
  );

  return NextResponse.json(rows);
}
