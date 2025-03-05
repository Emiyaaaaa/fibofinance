import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const rows = await sql("SELECT * FROM finance_data");

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const { name, type, amount, description, currency } = await request.json();

  const result = await sql(
    "INSERT INTO finance_data (name, type, amount, description, currency) VALUES ($1, $2, $3, $4, $5)",
    [name, type, amount, description, currency]
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

  const { id, name, type, amount, description, currency } =
    await request.json();

  const result = await sql(
    "UPDATE finance_data SET name = $1, type = $2, amount = $3, description = $4, currency = $5, updated_at = $6 WHERE id = $7",
    [name, type, amount, description, currency, new Date().toISOString(), id]
  );

  return NextResponse.json(result);
}
