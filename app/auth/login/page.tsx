"use client";

import { useState } from "react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const getAuthRedirectTo = () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;

    return `${siteUrl}/auth/callback`;
  };

  const handleMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Enter a real email address.");
      return;
    }

    setIsSending(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = getAuthRedirectTo();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsMagicLinkSent(true);
      setStatusMessage("Link sent. Check your inbox.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setErrorMessage(message);
      setIsMagicLinkSent(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = getAuthRedirectTo();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google login failed.";
      setErrorMessage(message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen noise-overlay">
      <Navigation />
      <section className="pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            Access
          </span>
          <h1 className="mt-6 text-4xl lg:text-6xl font-display tracking-tight">
            Log in
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Magic link or Google. No password drama.
          </p>

          <form onSubmit={handleMagicLink} className="mt-10 space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setIsMagicLinkSent(false);
                setStatusMessage(null);
              }}
              placeholder="you@company.com"
              className="h-12"
            />
            <Button
              type="submit"
              className="bg-foreground text-background rounded-full h-12 px-6 w-full"
              disabled={isSending || isMagicLinkSent}
            >
              {isSending
                ? "Sending link…"
                : isMagicLinkSent
                  ? "Link sent"
                  : "Send magic link"}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="flex-1 h-px bg-foreground/10" />
            or
            <span className="flex-1 h-px bg-foreground/10" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-full h-12 px-6 border-foreground/20 w-full"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? "Connecting…" : "Continue with Google"}
          </Button>

          {statusMessage && (
            <p className="mt-6 text-xs text-muted-foreground font-mono">
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <p
              className="mt-6 text-xs text-destructive font-mono"
              role="status"
            >
              {errorMessage}
            </p>
          )}

          <p className="mt-6 text-xs text-muted-foreground font-mono">
            We only use this to save your analyses.
          </p>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
