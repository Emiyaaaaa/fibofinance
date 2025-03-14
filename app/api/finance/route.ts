import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const rows = await sql("SELECT * FROM finance_data ORDER BY created_at DESC");

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const { name, type, amount, description, currency, owner } =
    await request.json();

  const result = await sql(
    "INSERT INTO finance_data (name, type, amount, description, currency, owner) VALUES ($1, $2, $3, $4, $5, $6)",
    [name, type, amount, description, currency, owner]
  );

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const { id } = await request.json();

  const result = await sql("DELETE FROM finance_data WHERE id = $1", [id]);

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const { id, name, type, amount, description, currency, owner } =
    await request.json();

  const result = await sql(
    "UPDATE finance_data SET name = $1, type = $2, amount = $3, description = $4, currency = $5, owner = $6, updated_at = $7 WHERE id = $8",
    [
      name,
      type,
      amount,
      description,
      currency,
      owner,
      new Date().toISOString(),
      id,
    ]
  );

  return NextResponse.json(result);
}
