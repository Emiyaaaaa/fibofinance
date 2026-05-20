import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { requirePasswordAuth } from "@/utils/passwordServer";

const DATA_TABLE = "finance_group_data";

export async function GET(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const rows = await sql(`SELECT * FROM ${DATA_TABLE}`);

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const { name } = await request.json();

  const rows = await sql(`INSERT INTO ${DATA_TABLE} (name) VALUES ($1) RETURNING id`, [name]);

  return NextResponse.json({ id: rows[0].id });
}

export async function PATCH(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const { id, name } = await request.json();

  const rows = await sql(`UPDATE ${DATA_TABLE} SET name = $1 WHERE id = $2`, [name, id]);

  return NextResponse.json(rows);
}

export async function DELETE(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const { id } = await request.json();

  const rows = await sql(`DELETE FROM ${DATA_TABLE} WHERE id = $1`, [id]);

  return NextResponse.json(rows);
}
