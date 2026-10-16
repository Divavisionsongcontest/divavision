
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jury_country, points } = body;

    if (
      typeof jury_country !== "string" ||
      !jury_country.trim() ||
      !points ||
      typeof points !== "object" ||
      Array.isArray(points)
    ) {
      return NextResponse.json(
        { error: "Invalid vote data." },
        { status: 400 }
      );
    }

    const entries = Object.entries(points);

    const validEntries = entries.filter(
      ([, value]) => typeof value === "number" && value > 0
    );

    const total = validEntries.reduce(
      (sum, [, value]) => sum + (value as number),
      0
    );

    if (
      entries.some(
        ([countryId, value]) =>
          !/^\d+$/.test(countryId) ||
          typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < 0
      ) ||
      total !== 15 ||
      validEntries.length < 3
    ) {
      return NextResponse.json(
        { error: "Your vote must use exactly 15 points across at least 3 countries." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;
 
    console.log("Supabase URL value:", JSON.stringify(supabaseUrl));

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("divavision_votes")
      .insert({
        phase: "first_semi_final",
        jury_country: jury_country.trim(),
        points,
      });

    if (error) {
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    },
    { status: 500 }
  );
}

       return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("divavision_votes")
      .select("id, jury_country, points")
      .eq("phase", "first_semi_final");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ votes: data });
  } catch (err) {
    console.error("API error:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}