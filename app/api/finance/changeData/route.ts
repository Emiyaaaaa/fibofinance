import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { requirePasswordAuth } from "@/utils/passwordServer";

export async function GET(request: NextRequest) {
  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  // get by group_id
  const group_id = request.nextUrl.searchParams.get("group_id");
  const rows = await sql("SELECT * FROM finance_change_data WHERE group_id = $1 ORDER BY updated_at DESC", [group_id]);

  return NextResponse.json(rows);
}
