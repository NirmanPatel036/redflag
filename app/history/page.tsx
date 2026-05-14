"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AnalysisResult } from "@/lib/analysis";

type HistoryItem = {
  id: string;
  context_type: string;
  verdict: string;
  result: AnalysisResult;
  created_at: string;
};

const contextLabels: Record<string, string> = {
  relationship: "Message",
  job_offer: "Job Offer",
  contract: "Contract",
  email: "Email",
  other: "Other",
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          setIsAuthed(false);
          setIsLoading(false);
          return;
        }

        setIsAuthed(true);
        const response = await fetch("/api/history?limit=10&offset=0", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 401) {
          setIsAuthed(false);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          const details = errorPayload?.details
            ? ` (${errorPayload.details})`
            : "";
          throw new Error(
            `${errorPayload?.error || "Failed to load history."}${details}`,
          );
        }

        const payload = await response.json();
        setItems(payload.items ?? []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something broke.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <main className="relative min-h-screen noise-overlay">
      <Navigation />
      <section className="pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
                <span className="w-8 h-px bg-foreground/30" />
                History
              </span>
              <h1 className="mt-6 text-4xl lg:text-6xl font-display tracking-tight">
                Your past verdicts
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {isAuthed
                  ? "Your saved analyses live here."
                  : "Log in to see your real analyses and shareable links."}
              </p>
            </div>
            {!isAuthed && (
              <Button
                asChild
                className="bg-foreground text-background rounded-full h-12 px-6"
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
            )}
          </div>

          <div className="mt-12 grid gap-6">
            {isLoading && (
              <div className="border border-foreground/10 p-6 text-sm text-muted-foreground">
                Loading history…
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            {!isLoading && isAuthed && !errorMessage && items.length === 0 && (
              <div className="border border-foreground/10 p-6 text-sm text-muted-foreground">
                No analyses yet. Paste something on the home page to get
                started.
              </div>
            )}

            {!isLoading &&
              isAuthed &&
              items.map((item) => (
                <div
                  key={item.id}
                  className="border border-foreground/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {contextLabels[item.context_type] ?? item.context_type}
                    </div>
                    <h3 className="text-2xl font-display mt-2">
                      {item.verdict.replace(/_/g, " ").toUpperCase()}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.result?.summary ?? "No summary available."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full h-10 px-4 border-foreground/20"
                    >
                      <Link href={`/result/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
