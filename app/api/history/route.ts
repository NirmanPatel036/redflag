import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const offsetParam = Number(searchParams.get("offset") ?? 0);

    const limit = Number.isFinite(limitParam) ? Math.min(limitParam, 50) : 10;
    const offset = Number.isFinite(offsetParam) ? Math.max(offsetParam, 0) : 0;

    const { data, error } = await supabase
      .from("analyses")
      .select("id, context_type, verdict, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("History fetch failed:", error);
      return NextResponse.json(
        { error: "Failed to fetch history.", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
