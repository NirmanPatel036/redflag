"use client";

import { useEffect, useState, useRef } from "react";

const redFlags = [
  {
    flag: "Unlimited PTO paired with always-on expectations",
    severity: "high",
    explanation:
      "Unlimited only works if time off is actually respected. The availability line says it isn't.",
  },
  {
    flag: "Equity vests over 10 years",
    severity: "medium",
    explanation:
      "That's a long cliff for a startup and a great way to keep you stuck.",
  },
];

const greenFlags = [
  {
    flag: "Clear title and ownership",
    explanation: "At least the role isn't vague fluff.",
  },
];

const severityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-foreground/10 text-foreground/70 border-foreground/20",
  low: "bg-foreground/5 text-foreground/60 border-foreground/10",
};

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="example"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Example output
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6">
              Here’s the kind
              <br />
              of truth you get.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10">
              A realistic job offer excerpt in. A blunt verdict out.
            </p>

            {/* Input excerpt */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-6">
              <div className="text-xs font-mono text-muted-foreground mb-3">
                Input · Job offer excerpt
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                We’re a family here and expect everyone to be available across
                time zones. We offer
                <span className="mx-1 px-1 bg-foreground/10">
                  unlimited PTO
                </span>
                and a generous equity grant that vests over 10 years. Base
                salary is $55,000 for the Senior Product Manager role.
              </p>
            </div>
          </div>

          {/* Right: Output preview */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10">
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  Verdict
                </span>
                <span className="px-3 py-1 text-xs font-mono bg-foreground text-background">
                  PROCEED WITH CAUTION
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase text-muted-foreground mb-3">
                    Red flags
                  </div>
                  <div className="space-y-3">
                    {redFlags.map((flag) => (
                      <div
                        key={flag.flag}
                        className="border border-foreground/10 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium text-foreground/90">
                            {flag.flag}
                          </p>
                          <span
                            className={`text-[10px] font-mono px-2 py-1 border ${
                              severityStyles[flag.severity]
                            }`}
                          >
                            {flag.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {flag.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-muted-foreground mb-3">
                    Green flags
                  </div>
                  <div className="border border-foreground/10 p-4">
                    <p className="font-medium text-foreground/90">
                      {greenFlags[0].flag}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {greenFlags[0].explanation}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-muted-foreground mb-3">
                    Summary
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    This reads like a culture pitch masking low pay and a heavy
                    workload. The equity terms are designed to keep you around,
                    not reward you. Not a scam, but it’s a bad trade unless
                    everything else is exceptional.
                  </p>
                </div>

                <div className="pt-4 border-t border-foreground/10">
                  <span className="text-sm text-muted-foreground blur-[1px] cursor-not-allowed">
                    See full analysis →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
