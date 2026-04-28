import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { requirePasswordAuth } from "@/utils/passwordServer";

export async function POST(request: Request) {
  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const { id } = await request.json();

  if (typeof id !== "number") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await sql(`UPDATE finance_group_data SET is_default = FALSE WHERE is_default = TRUE;`);

  await sql(`UPDATE finance_group_data SET is_default = TRUE WHERE id = $1;`, [id]);

  return NextResponse.json({});
}
