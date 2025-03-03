import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const rows = await sql("SELECT * FROM finance_data");

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const { name, type, amount, currency } = await request.json();

  const result = await sql(
    "INSERT INTO finance_data (name, type, amount, currency) VALUES ($1, $2, $3, $4)",
    [name, type, amount, currency]
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

  const { id, name, type, amount, currency } = await request.json();

  const result = await sql(
    "UPDATE finance_data SET name = $1, type = $2, amount = $3, currency = $4 WHERE id = $5",
    [name, type, amount, currency, id]
  );

  return NextResponse.json(result);
}
