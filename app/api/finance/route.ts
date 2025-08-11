import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";

const syncFinanceData = async (request: Request, group_id: number) => {
  const date = request.headers.get("x-fetch-local-date");

  if (!date) {
    return;
  }

  const finance_json = await sql(
    "SELECT id, name, amount, currency FROM finance_data WHERE group_id = $1 ORDER BY updated_at DESC",
    [group_id],
  );

  const finance_json_string = JSON.stringify(finance_json);

  const isDateExists = await sql("SELECT COUNT(*) FROM finance_change_data WHERE group_id = $1 AND date = $2", [
    group_id,
    date,
  ]).then((res) => Number(res[0].count) > 0);

  if (isDateExists) {
    await sql("UPDATE finance_change_data SET finance_json = $1, updated_at = $2 WHERE group_id = $3 AND date = $4", [
      finance_json_string,
      new Date().toISOString(),
      group_id,
      date,
    ]);
  } else {
    await sql("INSERT INTO finance_change_data (finance_json, group_id, date) VALUES ($1, $2, $3)", [
      finance_json_string,
      group_id,
      date,
    ]);
  }
};

export async function GET(request: NextRequest) {
  // get by group_id
  const group_id = request.nextUrl.searchParams.get("group_id");
  const orderBy = request.nextUrl.searchParams.get("order_by") || "updated_at";
  const order = request.nextUrl.searchParams.get("order") || "DESC";

  if (!["amount", "updated_at"].includes(orderBy)) {
    return NextResponse.json({ error: "Invalid orderBy" }, { status: 400 });
  }

  if (!["ASC", "DESC"].includes(order)) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const rows = await sql(`SELECT * FROM finance_data WHERE group_id = ${group_id} ORDER BY ${orderBy} ${order}`);

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { name, type, amount, description, currency, owner, group_id, icon, not_count } = await request.json();

  const result = await sql(
    "INSERT INTO finance_data (name, type, amount, description, currency, group_id, owner, not_count, icon) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
    [name, type, amount, description, currency, group_id, owner, not_count, icon],
  );

  syncFinanceData(request, group_id);

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const result = await sql("DELETE FROM finance_data WHERE id = $1 RETURNING group_id", [id]);

  const group_id = result[0].group_id;

  syncFinanceData(request, group_id);

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const { id, name, type, amount, description, currency, owner, group_id, not_count, updated_at, icon } =
    await request.json();
  // 如果没有update_at，不更新update_at
  let updateFields = [
    "name = $1",
    "type = $2",
    "amount = $3",
    "description = $4",
    "currency = $5",
    "group_id = $6",
    "owner = $7",
    "not_count = $8",
    "icon = $9",
  ];
  let values = [name, type, amount, description, currency, group_id, owner, not_count, icon];
  let paramIdx = values.length + 1;

  if (updated_at) {
    updateFields.push(`updated_at = $${paramIdx}`);
    values.push(updated_at);
    paramIdx++;
  }

  updateFields.push(`id = $${paramIdx}`);
  values.push(id);

  const updateSql = `UPDATE finance_data SET ${updateFields.join(", ")} WHERE id = $${paramIdx} RETURNING group_id`;

  const result = await sql(updateSql, values);

  if (updated_at) {
    syncFinanceData(request, group_id);
  }

  return NextResponse.json(result);
}
