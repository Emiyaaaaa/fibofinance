import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { getTotalFinance } from "@/utils/totalFinance";

const syncTotalData = async () => {
  // select amount and currency from finance_data
  const rows = (await sql("SELECT amount, currency FROM finance_data")) as {
    amount: number;
    currency: string;
  }[];

  const totalUSD = getTotalFinance(rows, "USD");
  const totalCNY = getTotalFinance(rows, "CNY");

  await sql(
    "INSERT INTO finance_change_data (total_usd, total_cny) VALUES ($1, $2)",
    [totalUSD, totalCNY]
  );
};

export async function GET() {
  const rows = await sql("SELECT * FROM finance_data ORDER BY created_at DESC");

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { name, type, amount, description, currency, owner } =
    await request.json();

  const result = await sql(
    "INSERT INTO finance_data (name, type, amount, description, currency, owner) VALUES ($1, $2, $3, $4, $5, $6)",
    [name, type, amount, description, currency, owner]
  );

  syncTotalData();

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const result = await sql("DELETE FROM finance_data WHERE id = $1", [id]);

  syncTotalData();

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
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

  syncTotalData();

  return NextResponse.json(result);
}
