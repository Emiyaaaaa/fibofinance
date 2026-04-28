import { NextResponse } from "next/server";

import { createPasswordMd5, getPasswordSettings, setPasswordAuthCookie } from "@/utils/passwordServer";

export async function POST(request: Request) {
  const { password } = await request.json();
  const settings = await getPasswordSettings();

  if (!settings) {
    return NextResponse.json({ authenticated: true, enabled: false, passwordLength: 4 });
  }

  if (typeof password !== "string" || createPasswordMd5(password) !== settings.passwordMd5) {
    return NextResponse.json({ authenticated: false, passwordLength: settings.passwordLength }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    enabled: true,
    passwordLength: settings.passwordLength,
  });

  setPasswordAuthCookie(response, settings.passwordMd5);

  return response;
}
