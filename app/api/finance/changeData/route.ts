import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";

export async function GET(request: NextRequest) {
  // get by group_id
  const group_id = request.nextUrl.searchParams.get("group_id");
  const rows = await sql(
    "SELECT * FROM finance_change_data WHERE group_id = $1 ORDER BY created_at DESC",
    [group_id]
  );

  return NextResponse.json(rows);
}
