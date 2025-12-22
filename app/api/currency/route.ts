import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";

export async function GET() {
  const rows = await sql("SELECT * FROM currency_data ORDER BY created_at ASC");
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { code, symbol, unit } = await request.json();

  if (!code || !symbol) {
    return NextResponse.json({ error: "code and symbol are required" }, { status: 400 });
  }

  try {
    const result = await sql(
      "INSERT INTO currency_data (code, symbol, unit) VALUES ($1, $2, $3) RETURNING *",
      [code.toUpperCase(), symbol, unit || null]
    );

    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error?.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Currency code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create currency" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = await sql("DELETE FROM currency_data WHERE id = $1 RETURNING *", [id]);

  if (result.length === 0) {
    return NextResponse.json({ error: "Currency not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

