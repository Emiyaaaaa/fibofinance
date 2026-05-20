import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { requirePasswordAuth } from "@/utils/passwordServer";

export async function GET(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const group_id = request.nextUrl.searchParams.get("group_id");

  if (!group_id) {
    const rows = await sql("SELECT * FROM finance_change_data ORDER BY date ASC, updated_at ASC");
    return NextResponse.json(rows);
  }

  const rows = await sql("SELECT * FROM finance_change_data WHERE group_id = $1 ORDER BY updated_at DESC", [group_id]);

  return NextResponse.json(rows);
}
