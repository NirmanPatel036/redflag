import { NextRequest, NextResponse } from "next/server";
import { AnalysisSchema, contextTypeValues } from "@/lib/analysis";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a brutally honest advisor. Analyze the provided text for red flags.
Return ONLY valid JSON in this exact shape:
{
  "verdict": "walk_away | proceed_with_caution | looks_fine",
  "red_flags": [{ "flag": "string", "severity": "high|medium|low", "explanation": "string" }],
  "green_flags": [{ "flag": "string", "explanation": "string" }],
  "summary": "2-3 sentence blunt verdict, no fluff",
  "recommended_questions": ["string"] // 2-3 things to ask or clarify
}
Be direct. Don't hedge. If something is bad, say it's bad.`;

const DEFAULT_ANTHROPIC_MODELS = [
  "claude-sonnet-4-6",
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
] as const;

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(text.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 },
      );
    }

    const text =
      typeof (body as { text?: string })?.text === "string"
        ? ((body as { text?: string }).text?.trim() ?? "")
        : "";
    const contextType =
      typeof (body as { context_type?: string })?.context_type === "string"
        ? ((body as { context_type?: string }).context_type?.trim() ?? "")
        : "";
    const sessionId =
      typeof (body as { session_id?: string })?.session_id === "string"
        ? ((body as { session_id?: string }).session_id?.trim() ?? "")
        : "";

    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const parsedContextType = contextTypeValues.find(
      (value) => value === contextType,
    );

    if (!parsedContextType) {
      return NextResponse.json(
        { error: "Invalid context_type." },
        { status: 400 },
      );
    }

    const user = await getUserFromRequest(request);
    const isAuthed = Boolean(user);
    const rateLimitKey = isAuthed ? user!.id : sessionId;

    if (!rateLimitKey) {
      return NextResponse.json(
        { error: "session_id is required for anonymous requests." },
        { status: 400 },
      );
    }

    const limit = isAuthed ? 20 : 3;
    const now = new Date();

    const { data: rateRow, error: rateError } = await supabase
      .from("rate_limits")
      .select("count, window_start")
      .eq("session_id", rateLimitKey)
      .maybeSingle();

    if (rateError) {
      return NextResponse.json(
        { error: "Rate limit check failed." },
        { status: 500 },
      );
    }

    if (!rateRow) {
      const { error: insertRateError } = await supabase
        .from("rate_limits")
        .insert({ session_id: rateLimitKey, count: 1, window_start: now });

      if (insertRateError) {
        return NextResponse.json(
          { error: "Rate limit update failed." },
          { status: 500 },
        );
      }
    } else {
      const windowStart = new Date(rateRow.window_start);
      const isExpired =
        now.getTime() - windowStart.getTime() > 24 * 60 * 60 * 1000;

      if (isExpired) {
        const { error: resetError } = await supabase
          .from("rate_limits")
          .update({ count: 1, window_start: now })
          .eq("session_id", rateLimitKey);

        if (resetError) {
          return NextResponse.json(
            { error: "Rate limit reset failed." },
            { status: 500 },
          );
        }
      } else if (rateRow.count >= limit) {
        return NextResponse.json(
          { error: "Rate limit exceeded." },
          { status: 429 },
        );
      } else {
        const { error: incrementError } = await supabase
          .from("rate_limits")
          .update({ count: rateRow.count + 1 })
          .eq("session_id", rateLimitKey);

        if (incrementError) {
          return NextResponse.json(
            { error: "Rate limit update failed." },
            { status: 500 },
          );
        }
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY." },
        { status: 500 },
      );
    }

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const modelCandidates = (
      process.env.ANTHROPIC_MODELS ??
      process.env.ANTHROPIC_MODEL ??
      DEFAULT_ANTHROPIC_MODELS.join(",")
    )
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    let content = "";
    let upstreamErrorMessage = "Analysis failed.";

    for (const model of modelCandidates) {
      try {
        const message = await client.messages.create({
          model,
          max_tokens: 800,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Context type: ${parsedContextType}\n\nText:\n`,
                  cache_control: { type: "ephemeral" },
                },
                {
                  type: "text",
                  text,
                },
              ],
            },
          ],
        });

        content = message.content
          .map((block) => (block.type === "text" ? block.text : ""))
          .join("");
        break;
      } catch (error: unknown) {
        upstreamErrorMessage =
          error instanceof Error ? error.message : "Analysis failed.";
        console.error("Anthropic SDK call failed", {
          model,
          error: upstreamErrorMessage,
        });
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: upstreamErrorMessage },
        { status: 502 },
      );
    }

    const parsed = extractJson(content);
    const validation = AnalysisSchema.safeParse(parsed);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid AI response." },
        { status: 502 },
      );
    }

    const result = validation.data;
    const payload = {
      context_type: parsedContextType,
      input_text: text,
      result,
      verdict: result.verdict,
    };

    if (isAuthed) {
      const { data: saved, error: insertError } = await supabase
        .from("analyses")
        .insert({ ...payload, user_id: user!.id })
        .select("id")
        .single();

      if (insertError || !saved) {
        return NextResponse.json(
          { error: "Failed to store analysis." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        id: saved.id,
        verdict: result.verdict,
        result,
        is_anonymous: false,
      });
    }

    const { data: saved, error: insertError } = await supabase
      .from("anonymous_analyses")
      .insert({ ...payload, session_id: rateLimitKey })
      .select("id")
      .single();

    if (insertError || !saved) {
      return NextResponse.json(
        { error: "Failed to store analysis." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: saved.id,
      verdict: result.verdict,
      result,
      is_anonymous: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
