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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServerClient();
    const user = await getUserFromRequest(request);
    const { id: analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }

    if (user) {
      const { data, error } = await supabase
        .from("analyses")
        .select("id, context_type, verdict, result, input_text, created_at")
        .eq("id", analysisId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: "Failed to load analysis." },
          { status: 500 },
        );
      }

      if (data) {
        return NextResponse.json({ item: { ...data, is_anonymous: false } });
      }
    }

    const { data: anonData, error: anonError } = await supabase
      .from("anonymous_analyses")
      .select("id, context_type, verdict, result, input_text, created_at")
      .eq("id", analysisId)
      .maybeSingle();

    if (anonError) {
      return NextResponse.json(
        { error: "Failed to load analysis." },
        { status: 500 },
      );
    }

    if (!anonData) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ item: { ...anonData, is_anonymous: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServerClient();
    const user = await getUserFromRequest(request);
    const { id: analysisId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete analysis." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
