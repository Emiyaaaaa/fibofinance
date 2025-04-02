import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";

const syncFinanceData = async (group_id: number) => {
  const finance_json = await sql(
    "SELECT id, name, amount, currency FROM finance_data WHERE group_id = $1 ORDER BY created_at DESC",
    [group_id]
  );

  const finance_json_string = JSON.stringify(finance_json);

  await sql(
    "INSERT INTO finance_change_data (finance_json, group_id) VALUES ($1, $2)",
    [finance_json_string, group_id]
  );
};

export async function GET(request: NextRequest) {
  // get by group_id
  const group_id = request.nextUrl.searchParams.get("group_id");

  const rows = await sql(
    "SELECT * FROM finance_data WHERE group_id = $1 ORDER BY created_at DESC",
    [group_id]
  );

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { name, type, amount, description, currency, owner, group_id } =
    await request.json();

  const result = await sql(
    "INSERT INTO finance_data (name, type, amount, description, currency, group_id, owner) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [name, type, amount, description, currency, group_id, owner]
  );

  syncFinanceData(group_id);

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const result = await sql(
    "DELETE FROM finance_data WHERE id = $1 RETURNING group_id",
    [id]
  );

  const group_id = result[0].group_id;

  syncFinanceData(group_id);

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const { id, name, type, amount, description, currency, owner, group_id } =
    await request.json();

  const result = await sql(
    "UPDATE finance_data SET name = $1, type = $2, amount = $3, description = $4, currency = $5, group_id = $6, owner = $7, updated_at = $8 WHERE id = $9",
    [
      name,
      type,
      amount,
      description,
      currency,
      group_id,
      owner,
      new Date().toISOString(),
      id,
    ]
  );

  syncFinanceData(group_id);

  return NextResponse.json(result);
}
