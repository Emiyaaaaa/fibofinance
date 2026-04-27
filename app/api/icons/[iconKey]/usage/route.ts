import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ iconKey: string }> }
) {
  const { iconKey: rawIconKey } = await params;
  const iconKey = decodeURIComponent(rawIconKey);

  if (!iconKey || iconKey.length > 50 || !/^[a-zA-Z0-9-]+$/.test(iconKey)) {
    return NextResponse.json({ error: "Invalid icon key" }, { status: 400 });
  }

  try {
    const rows = await sql("SELECT COUNT(*) as count FROM finance_data WHERE icon = $1", [iconKey]);
    const count = Number(rows[0]?.count ?? 0);

    return NextResponse.json({
      isUsed: count > 0,
      count,
    });
  } catch {
    return NextResponse.json({ error: "Failed to check icon usage" }, { status: 500 });
  }
}
