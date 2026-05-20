import { NextResponse } from "next/server";

import { verifyPasswordRequest } from "@/utils/passwordServer";
import { sql } from "@/utils/sql";

export async function GET(request: Request) {
  const auth = await verifyPasswordRequest(request);

  if (!auth.ok) {
    return NextResponse.json(
      { authenticated: false, passwordLength: auth.passwordLength, sqlExists: Boolean(sql) },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    enabled: auth.enabled,
    passwordLength: auth.passwordLength,
    sqlExists: Boolean(sql),
  });
}
