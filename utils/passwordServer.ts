import { createHash, createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import {
  DEFAULT_PASSWORD_LENGTH,
  PASSWORD_AUTH_COOKIE,
  PASSWORD_SETTING_KEY,
  PasswordLength,
  normalizePasswordLength,
} from "./password";
import { sql } from "./sql";

export interface PasswordSettings {
  passwordMd5: string;
  passwordLength: PasswordLength;
}

export const createPasswordMd5 = (password: string) => {
  return createHash("md5").update(password).digest("hex");
};

const getAuthSecret = () => {
  return (
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.DATABASE_URL || "fibofinance-auth-secret"
  );
};

export const createPasswordAuthToken = (passwordMd5: string) => {
  return createHmac("sha256", getAuthSecret()).update(`password:${passwordMd5}`).digest("hex");
};

const parseCookieHeader = (cookieHeader: string | null) => {
  return Object.fromEntries(
    (cookieHeader ?? "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separatorIndex = item.indexOf("=");
        const key = separatorIndex >= 0 ? item.slice(0, separatorIndex) : item;
        const value = separatorIndex >= 0 ? item.slice(separatorIndex + 1) : "";

        return [key, decodeURIComponent(value)] as const;
      })
  );
};

const isEqualToken = (token: string, expectedToken: string) => {
  const encoder = new TextEncoder();
  const tokenBytes = encoder.encode(token);
  const expectedTokenBytes = encoder.encode(expectedToken);

  return tokenBytes.length === expectedTokenBytes.length && timingSafeEqual(tokenBytes, expectedTokenBytes);
};

export const setPasswordAuthCookie = (response: NextResponse, passwordMd5: string) => {
  response.cookies.set(PASSWORD_AUTH_COOKIE, createPasswordAuthToken(passwordMd5), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
};

export const clearPasswordAuthCookie = (response: NextResponse) => {
  response.cookies.delete(PASSWORD_AUTH_COOKIE);
};

const ensureSettingsTable = async () => {
  if (!sql) {
    return;
  }

  await sql(
    `
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );
};

export const getPasswordSettings = async (): Promise<PasswordSettings | null> => {
  if (!sql) {
    return null;
  }

  await ensureSettingsTable();

  const rows = await sql("SELECT value FROM settings WHERE key = $1 LIMIT 1", [PASSWORD_SETTING_KEY]);
  const value = rows[0]?.value;

  if (!value) {
    return null;
  }

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const passwordMd5 = typeof parsed.passwordMd5 === "string" ? parsed.passwordMd5 : "";

    if (!passwordMd5) {
      return null;
    }

    return {
      passwordMd5,
      passwordLength: normalizePasswordLength(parsed.passwordLength),
    };
  } catch {
    return null;
  }
};

export const setPasswordSettings = async (password: string, passwordLength: PasswordLength) => {
  if (!sql) {
    return;
  }

  await ensureSettingsTable();

  const passwordMd5 = createPasswordMd5(password);
  const value = JSON.stringify({ passwordMd5, passwordLength });

  await sql(
    `
      INSERT INTO settings (key, value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `,
    [PASSWORD_SETTING_KEY, value]
  );

  return { passwordMd5, passwordLength };
};

export const deletePasswordSettings = async () => {
  if (!sql) {
    return;
  }

  await ensureSettingsTable();

  await sql("DELETE FROM settings WHERE key = $1", [PASSWORD_SETTING_KEY]);
};

export const verifyPasswordRequest = async (request: Request) => {
  const settings = await getPasswordSettings();

  if (!settings) {
    return {
      ok: true,
      enabled: false,
      passwordLength: DEFAULT_PASSWORD_LENGTH,
    };
  }

  const passwordAuthToken = parseCookieHeader(request.headers.get("cookie"))[PASSWORD_AUTH_COOKIE];
  const expectedToken = createPasswordAuthToken(settings.passwordMd5);

  return {
    ok: typeof passwordAuthToken === "string" && isEqualToken(passwordAuthToken, expectedToken),
    enabled: true,
    passwordLength: settings.passwordLength,
  };
};

export const createPasswordUnauthorizedResponse = (passwordLength: PasswordLength = DEFAULT_PASSWORD_LENGTH) => {
  return NextResponse.json({ error: "Unauthorized", passwordLength }, { status: 401 });
};

export const requirePasswordAuth = async (request: Request) => {
  const auth = await verifyPasswordRequest(request);

  if (auth.ok) {
    return null;
  }

  return createPasswordUnauthorizedResponse(auth.passwordLength);
};
