"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const finalizeAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const callbackUrl = new URL(window.location.href);
        const authError =
          callbackUrl.searchParams.get("error_description") ||
          callbackUrl.searchParams.get("error");

        if (authError) {
          throw new Error(authError);
        }

        const code = callbackUrl.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw new Error(error.message);
          }

          router.replace("/history");
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        if (data.session) {
          router.replace("/history");
          return;
        }

        router.replace("/auth/login?error=missing_session");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Auth callback failed.";
        setErrorMessage(message);
        setTimeout(() => {
          router.replace("/auth/login?error=callback");
        }, 1500);
      }
    };

    finalizeAuth();
  }, [router]);

  return (
    <main className="relative min-h-screen noise-overlay">
      <Navigation />
      <section className="pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            Finalizing
          </span>
          <h1 className="mt-6 text-3xl lg:text-5xl font-display tracking-tight">
            Logging you in
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Hang tight. We’re finishing the auth handshake.
          </p>
          {errorMessage && (
            <p className="mt-6 text-xs text-destructive font-mono" role="status">
              {errorMessage}
            </p>
          )}
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
