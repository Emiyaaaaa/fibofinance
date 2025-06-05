import { NextResponse } from "next/server";

import { sql } from "@/utils/sql";

export async function GET() {
  const rows = await sql("SELECT * FROM icons ORDER BY created_at DESC");
  
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { key, svg, name } = await request.json();
  
  // Validate SVG content
  if (!svg || !svg.includes("<svg")) {
    return NextResponse.json({ error: "Invalid SVG content" }, { status: 400 });
  }
  
  try {
    const result = await sql(
      "INSERT INTO icons (key, svg, name) VALUES ($1, $2, $3) RETURNING *",
      [key, svg, name]
    );
    
    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: "Icon key already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create icon" }, { status: 500 });
  }
}