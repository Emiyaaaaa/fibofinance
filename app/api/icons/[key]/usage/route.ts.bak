import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/utils/sql";

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const { key } = params;
  
  if (!key) {
    return NextResponse.json({ error: "Icon key is required" }, { status: 400 });
  }
  
  try {
    const usageCount = await sql(
      "SELECT COUNT(*) as count FROM finance_data WHERE icon = $1",
      [key]
    );
    
    const count = parseInt(usageCount[0].count);
    
    return NextResponse.json({ 
      iconKey: key,
      usageCount: count,
      isUsed: count > 0
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check icon usage" }, { status: 500 });
  }
}