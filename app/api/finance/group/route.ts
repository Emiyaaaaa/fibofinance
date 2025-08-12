import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";

const DATA_TABLE = "finance_group";

export async function GET() {
  const rows = await sql(`SELECT * FROM ${DATA_TABLE}`);

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { name } = await request.json();

  const rows = await sql(
    `INSERT INTO ${DATA_TABLE} (name) VALUES ($1) RETURNING id`,
    [name]
  );

  return NextResponse.json({ id: rows[0].id });
}

export async function PATCH(request: Request) {
  const { id, name } = await request.json();

  const rows = await sql(
    `UPDATE ${DATA_TABLE} SET name = $1 WHERE id = $2`,
    [name, id]
  );

  return NextResponse.json(rows);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const rows = await sql(`DELETE FROM ${DATA_TABLE} WHERE id = $1`, [id]);

  return NextResponse.json(rows);
}
