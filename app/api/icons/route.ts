import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";
import { containsDangerousSvgPatterns, isSvgWithinSizeLimit, validateSvgStructure } from "@/utils/svgSecurity";
import { sanitizeSvgServer } from "@/utils/sanitizeSvgServer";
import { requirePasswordAuth } from "@/utils/passwordServer";

function validateIconSvgInput(svg: unknown) {
  if (!svg || typeof svg !== "string") {
    return NextResponse.json({ error: "Invalid SVG content" }, { status: 400 });
  }

  if (!isSvgWithinSizeLimit(svg)) {
    return NextResponse.json({ error: "SVG content is too large" }, { status: 400 });
  }

  if (!validateSvgStructure(svg)) {
    return NextResponse.json({ error: "Invalid SVG content" }, { status: 400 });
  }

  if (containsDangerousSvgPatterns(svg)) {
    return NextResponse.json({ error: "SVG contains potentially dangerous content" }, { status: 400 });
  }

  return null;
}

export async function GET(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }
  const authResponse = await requirePasswordAuth(request);
  if (authResponse) return authResponse;

  const rows = await sql("SELECT * FROM icons ORDER BY created_at DESC");

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }
  const authResponse = await requirePasswordAuth(request);

  if (authResponse) return authResponse;

  const { key, svg, name } = await request.json();

  // Validate key
  if (!key || typeof key !== "string" || key.length > 50) {
    return NextResponse.json({ error: "Invalid icon key" }, { status: 400 });
  }

  // Validate key format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(key)) {
    return NextResponse.json({ error: "Icon key can only contain letters, numbers, and hyphens" }, { status: 400 });
  }

  const svgValidationResponse = validateIconSvgInput(svg);
  if (svgValidationResponse) return svgValidationResponse;

  const verifiedSvg = sanitizeSvgServer(svg);

  if (!verifiedSvg) {
    return NextResponse.json({ error: "Invalid SVG content" }, { status: 400 });
  }

  // Validate name
  const sanitizedName = name ? String(name).slice(0, 100) : key;

  try {
    const result = await sql("INSERT INTO icons (key, svg, name) VALUES ($1, $2, $3) RETURNING *", [
      key,
      verifiedSvg,
      sanitizedName,
    ]);

    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      // Unique violation
      return NextResponse.json({ error: "Icon key already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create icon" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }
  const authResponse = await requirePasswordAuth(request);

  if (authResponse) return authResponse;

  const { key, svg, name } = await request.json();

  // Validate key
  if (!key || typeof key !== "string" || key.length > 50) {
    return NextResponse.json({ error: "Invalid icon key" }, { status: 400 });
  }

  // Validate key format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(key)) {
    return NextResponse.json({ error: "Icon key can only contain letters, numbers, and hyphens" }, { status: 400 });
  }

  const svgValidationResponse = validateIconSvgInput(svg);
  if (svgValidationResponse) return svgValidationResponse;

  const verifiedSvg = sanitizeSvgServer(svg);

  if (!verifiedSvg) {
    return NextResponse.json({ error: "Invalid SVG content" }, { status: 400 });
  }

  // Validate name
  const sanitizedName = name ? String(name).slice(0, 100) : key;

  try {
    const result = await sql("UPDATE icons SET svg = $1, name = $2 WHERE key = $3 RETURNING *", [
      verifiedSvg,
      sanitizedName,
      key,
    ]);

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update icon" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const authResponse = await requirePasswordAuth(request);

  if (authResponse) return authResponse;

  const { key } = await request.json();

  if (!key) {
    return NextResponse.json({ error: "Icon key is required" }, { status: 400 });
  }

  try {
    // Check if icon is being used
    const usageCount = await sql("SELECT COUNT(*) as count FROM finance_data WHERE icon = $1", [key]);

    const isUsed = parseInt(usageCount[0].count) > 0;

    // Delete the icon
    const result = await sql("DELETE FROM icons WHERE key = $1 RETURNING *", [key]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Icon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deleted: result[0],
      wasUsed: isUsed,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete icon" }, { status: 500 });
  }
}
