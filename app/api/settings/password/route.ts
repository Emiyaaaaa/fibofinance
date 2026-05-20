import { NextResponse } from "next/server";

import { isValidNumericPassword, normalizePasswordLength } from "@/utils/password";

const isDemoMode = process.env.DEMO_MODE === "true";

function createDemoModeResponse() {
  return NextResponse.json({ error: "demo_mode" }, { status: 403 });
}
import {
  clearPasswordAuthCookie,
  createPasswordUnauthorizedResponse,
  deletePasswordSettings,
  getPasswordSettings,
  setPasswordSettings,
  setPasswordAuthCookie,
  verifyPasswordRequest,
} from "@/utils/passwordServer";

export async function GET(request: Request) {
  const auth = await verifyPasswordRequest(request);

  if (!auth.ok) {
    return createPasswordUnauthorizedResponse(auth.passwordLength);
  }

  const settings = await getPasswordSettings();

  return NextResponse.json({
    isSet: Boolean(settings),
    passwordLength: settings?.passwordLength ?? 4,
  });
}

export async function POST(request: Request) {
  if (isDemoMode) {
    return createDemoModeResponse();
  }

  const auth = await verifyPasswordRequest(request);

  if (!auth.ok) {
    return createPasswordUnauthorizedResponse(auth.passwordLength);
  }

  const { password, passwordLength: rawPasswordLength } = await request.json();
  const passwordLength = normalizePasswordLength(rawPasswordLength);

  if (typeof password !== "string" || !isValidNumericPassword(password, passwordLength)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  const settings = await setPasswordSettings(password, passwordLength);

  if (!settings) {
    return NextResponse.json({ error: "Failed to set password settings" }, { status: 500 });
  }

  const response = NextResponse.json({
    passwordLength: settings.passwordLength,
  });

  setPasswordAuthCookie(response, settings.passwordMd5);

  return response;
}

export async function DELETE(request: Request) {
  const auth = await verifyPasswordRequest(request);

  if (!auth.ok) {
    return createPasswordUnauthorizedResponse(auth.passwordLength);
  }

  await deletePasswordSettings();

  const response = NextResponse.json({ success: true });
  clearPasswordAuthCookie(response);

  return response;
}
