import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";

const TABLE = "exchange_rate_data";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (date) {
    const rows = await sql(`SELECT * FROM ${TABLE} WHERE date = $1 ORDER BY created_at DESC`, [date]);
    return NextResponse.json(rows);
  }

  const rows = await sql(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { rates_json, date } = await request.json();

  if (typeof rates_json !== "string" || typeof date !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const exists = await sql(`SELECT COUNT(*) FROM ${TABLE} WHERE date = $1`, [date]).then((r) => Number(r[0].count) > 0);

  if (exists) {
    const rows = await sql(
      `UPDATE ${TABLE} SET rates_json = $1, created_at = CURRENT_TIMESTAMP WHERE date = $2 RETURNING id`,
      [rates_json, date]
    );
    return NextResponse.json({ id: rows[0]?.id });
  }

  const rows = await sql(`INSERT INTO ${TABLE} (rates_json, date) VALUES ($1, $2) RETURNING id`, [rates_json, date]);
  return NextResponse.json({ id: rows[0].id });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (typeof id !== "number") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const rows = await sql(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING id`, [id]);
  return NextResponse.json(rows[0] ?? {});
}
