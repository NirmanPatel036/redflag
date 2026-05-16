"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSphere } from "./animated-sphere";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { contextTypeValues } from "@/lib/analysis";

const headline = "Paste it. Find out the truth.";
const subheadline =
  "Paste any message, job offer, or contract. Get a second opinion that doesn't sugarcoat.";

const contextOptions: Array<{
  value: (typeof contextTypeValues)[number];
  label: string;
  emoji: string;
}> = [
  { value: "relationship", label: "Message", emoji: "💬" },
  { value: "job_offer", label: "Job Offer", emoji: "💼" },
  { value: "contract", label: "Contract", emoji: "📄" },
  { value: "email", label: "Email", emoji: "📧" },
  { value: "other", label: "Other", emoji: "❓" },
];

const highlights = [
  { value: "3/day", label: "anon analyses", sub: "no signup" },
  { value: "20/day", label: "authed analyses", sub: "supabase auth" },
  { value: "7 days", label: "anon retention", sub: "auto-delete" },
  { value: "0%", label: "sugarcoating", sub: "by design" },
];

const sampleInputs: Array<{
  context: (typeof contextTypeValues)[number];
  text: string;
}> = [
  {
    context: "job_offer",
    text: `We're a fast-moving startup and we move fast here. The base is $65,000
but there's huge upside in equity - 0.01% vesting over 4 years with a
2-year cliff. We don't really do formal performance reviews, growth here
is based on merit and we'll know it when we see it. Hours are flexible,
we just ask that you're available when the team needs you. The role is
technically an independent contractor position for the first 6 months
but we treat everyone like family. Unlimited PTO (we trust you to manage
your own time responsibly).`,
  },
  {
    context: "relationship",
    text: `Hey. I know I've been distant. I've just been dealing with a lot and
you know how I get. I do care about you, I just show it differently.
You're too sensitive sometimes and that makes it hard for me to open up.
I think if you could just give me a little more space and stop bringing
up the past we could actually make this work. I'm not like this with
everyone, just so you know. You just have a way of triggering me.`,
  },
  {
    context: "contract",
    text: `The Company reserves the right to modify, suspend, or terminate this
agreement at any time without prior notice or cause. Compensation
adjustments may be made at the sole discretion of management and are
not subject to appeal. The Employee agrees that any work produced
during or outside of working hours, using personal or company resources,
is the exclusive intellectual property of the Company. This agreement
is subject to change and continued employment constitutes acceptance
of any modifications.`,
  },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const [selectedContext, setSelectedContext] =
    useState<(typeof contextTypeValues)[number]>("relationship");
  const [inputText, setInputText] = useState("");
  const [pulse, setPulse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pulseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  const triggerPulse = () => {
    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current);
    }
    setPulse(true);
    pulseTimeoutRef.current = window.setTimeout(() => setPulse(false), 700);
  };

  const handleInsertSample = () => {
    const sample =
      sampleInputs[Math.floor(Math.random() * sampleInputs.length)];
    setSelectedContext(sample.context);
    setInputText(sample.text);
    setErrorMessage(null);
    triggerPulse();
    textareaRef.current?.focus();
  };

  const getSessionId = () => {
    if (typeof window === "undefined") return "";
    const storageKey = "rf_session_id";
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const nextId =
      window.crypto?.randomUUID?.() ??
      `rf_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(storageKey, nextId);
    return nextId;
  };

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputText.trim();

    if (!trimmed) {
      setErrorMessage("Paste something first.");
      return;
    }

    if (!contextTypeValues.includes(selectedContext)) {
      setErrorMessage("Pick a context so we know what we’re judging.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      const sessionId = accessToken ? undefined : getSessionId();

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          text: trimmed,
          context_type: selectedContext,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const message =
          errorPayload?.error || "We couldn’t analyze that. Try again.";
        throw new Error(message);
      }

      const payload = await response.json();
      if (payload?.id) {
        router.push(`/result/${payload.id}`);
      } else {
        throw new Error("No analysis ID returned.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something broke.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="text-center">
          <div
            className={`mb-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <span className="w-8 h-px bg-foreground/30" />
              Brutally honest second opinion
            </span>
          </div>

          <h1
            className={`text-[clamp(2.8rem,9vw,6rem)] font-display leading-[0.95] tracking-tight transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block md:hidden">
              <span className="block">Paste it.</span>
              <span className="block">
                Find out the <span className="text-destructive">truth.</span>
              </span>
            </span>
            <span className="hidden md:block">
              {headline.split("").map((char, index, arr) => {
                // Highlight "the truth" (last 9 chars excluding the final period)
                const isTruth =
                  index >= arr.length - 10 && index < arr.length - 1;
                return (
                  <span
                    key={`${char}-${index}`}
                    className={`inline-block animate-char-in ${isTruth ? "text-destructive" : ""}`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </span>
          </h1>

          <p
            className={`mt-6 text-lg lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {subheadline}
          </p>
          <div className="-mb-5 mt-2 flex justify-center">
            <a
              href="#how-it-works"
              className="inline-flex mt-1 items-center gap-2 rounded-full border border-foreground/20 bg-background/60 px-3 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
              aria-label="Scroll down for more information"
            >
              <span>Scroll to understand what do we catch</span>
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </div>

        <form
          onSubmit={handleAnalyze}
          className={`mt-8 lg:mt-12 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative border border-foreground/15 bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleInsertSample}
                className="absolute right-4 top-4 rounded-full border-foreground/20 z-10"
              >
                Sample
              </Button>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(event) => {
                  setInputText(event.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onPaste={triggerPulse}
                autoFocus
                placeholder="Paste the message, clause, or offer that feels off..."
                className="w-full min-h-[220px] lg:min-h-[260px] bg-transparent text-lg lg:text-xl placeholder:text-muted-foreground/70 focus:outline-none px-6 py-6"
                aria-label="Text to analyze"
              />
              <div className="px-6 py-4 border-t border-foreground/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
                <span className="font-mono">
                  Anonymous by default. We forget fast.
                </span>
                <span className="font-mono">No signup needed.</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {contextOptions.map((option) => {
                const isActive = option.value === selectedContext;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedContext(option.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    aria-pressed={isActive}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "bg-foreground text-background border-foreground scale-105"
                        : "bg-background/60 text-foreground/70 border-foreground/20 hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    <span className="text-base" aria-hidden>
                      {option.emoji}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || inputText.trim().length === 0}
                className={`bg-foreground hover:bg-foreground/90 text-background px-10 h-14 text-base rounded-full ${
                  pulse ? "pulse-once" : ""
                }`}
              >
                {isSubmitting ? "Analyzing…" : "Analyze This"}
              </Button>
              <p className="text-xs text-muted-foreground font-mono">
                Paste text → get a verdict. No fluff.
              </p>
              {errorMessage && (
                <p className="text-xs text-destructive font-mono" role="status">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      <div
        className={`absolute bottom-10 left-0 right-0 transition all duration-700 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16 pr-16">
              {highlights.map((stat) => (
                <div
                  key={`${stat.label}-${i}`}
                  className="flex items-baseline gap-4"
                >
                  <span className="text-4xl lg:text-5xl font-display">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                    <span className="block font-mono text-xs mt-1">
                      {stat.sub}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
