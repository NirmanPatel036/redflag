"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const contextCards = [
  {
    title: "Messages & Texts",
    description: "Is this person wasting your time?",
    detail: "Mixed signals don’t get better on their own.",
    emoji: "💬",
    signal: "Guilt loops + blame shifting",
    sample: "“You made me do this.”",
  },
  {
    title: "Job Offers",
    description: "Equity that vests in 10 years isn't equity.",
    detail: "If the numbers feel low, they are.",
    emoji: "💼",
    signal: "Vague role + upside-only comp",
    sample: "“We’ll fix title and pay later.”",
  },
  {
    title: "Contracts & Clauses",
    description: "Read what you're actually signing.",
    detail: "Hidden penalties are still penalties.",
    emoji: "📄",
    signal: "One-sided termination rights",
    sample: "“Company may change terms at any time.”",
  },
  {
    title: "Emails",
    description: "Spot the manipulation before you reply.",
    detail: "Urgency is a tactic, not a fact.",
    emoji: "📧",
    signal: "Pressure + fake deadlines",
    sample: "“Act now or lose everything.”",
  },
];

const cardSizes = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
];

const chatLines = [
  {
    sender: "other",
    text: "You always turn one small thing into a whole investigation, and it makes me not want to say anything.",
  },
  {
    sender: "you",
    text: "I asked where we stand because your answers keep changing depending on the day.",
  },
  {
    sender: "other",
    text: "If you actually trusted me, you would not need to keep checking up on what I mean.",
  },
  {
    sender: "you",
    text: "Trust is easier when the story is consistent and I am not guessing what counts.",
  },
  {
    sender: "other",
    text: "You are making this sound way more serious than it is. We have been good lately.",
  },
  {
    sender: "you",
    text: "Being good lately is not the same as being clear. Are we exclusive or not?",
  },
  {
    sender: "other",
    text: "Why do you always need a label for everything? Can't we just let it be normal?",
  },
  {
    sender: "you",
    text: "A label is not pressure. It is basic information before I keep investing time here.",
  },
  {
    sender: "other",
    text: "I told you I care about you, and honestly that should count for something by now.",
  },
  {
    sender: "you",
    text: "It does count. It just does not answer the question you keep avoiding.",
  },
  {
    sender: "other",
    text: "Can we not do this tonight? I am exhausted and I do not want another argument.",
  },
  {
    sender: "you",
    text: "We can pause tonight, but I am not going to pretend the mixed signals feel fine.",
  },
  {
    sender: "other",
    text: "This is exactly what I mean. You make me feel like I am always failing some test.",
  },
  {
    sender: "you",
    text: "I am not testing you. I am listening to what you say and comparing it with what you do.",
  },
  {
    sender: "other",
    text: "I guess nothing I say is enough unless it is exactly the wording you want.",
  },
  {
    sender: "you",
    text: "The wording is simple: either you want the same thing, or you do not.",
  },
] as const;

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const typingSender =
    chatStep < chatLines.length
      ? chatLines[chatStep].sender
      : chatLines[0].sender;
  const visibleChatLines = chatLines.slice(0, chatStep);
  const shouldScrollTranscript = chatStep > 7;
  const transcriptOffset = -Math.max(0, chatStep - 7) * 68;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setChatStep((prev) => (prev + 1) % (chatLines.length + 1));
    }, 3400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section id="contexts" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-red-500/70" />
            Context types
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            What you can
            <br />
            <span className="text-muted-foreground">run through it.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-6">
          {contextCards.map((card, index) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden border border-foreground/10 bg-background p-6 lg:p-8 transition-all duration-700 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-[0_16px_50px_-24px_rgba(239,68,68,0.55)] ${
                cardSizes[index] || ""
              } ${index === 0 ? "flex h-[780px] min-h-0 flex-col" : ""} ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(239,68,68,0.10), transparent 45%)",
                }}
              />

              <div className="relative flex items-center justify-between gap-4 mb-6">
                <div className="text-3xl" aria-hidden>
                  {card.emoji}
                </div>
                <span className="inline-flex items-center rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-red-600">
                  Risk Pattern
                </span>
              </div>

              <h3 className="text-2xl font-display mb-3 transition-colors duration-300 group-hover:text-red-600">
                {card.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>

              <p className="mt-5 text-sm text-foreground/80">{card.signal}</p>

              <p className="mt-6 text-xs font-mono text-muted-foreground">
                {card.detail}
              </p>

              {index !== 0 && (
                <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-mono text-red-600">
                  {card.sample}
                </p>
              )}

              <div className="mt-5 h-px w-full bg-gradient-to-r from-red-500/60 via-red-500/20 to-transparent" />

              {index === 0 && (
                <div className=" mt-4 relative min-h-0 flex-1 overflow-hidden">
                  <motion.div
                    animate={{ y: transcriptOffset }}
                    transition={{ duration: 0.85, ease: "easeInOut" }}
                    className="space-y-2 pb-8"
                  >
                    <AnimatePresence initial={false}>
                      {visibleChatLines.map((line, lineIndex) => (
                        <motion.div
                          layout
                          key={line.text}
                          initial={{
                            opacity: 0,
                            x: line.sender === "you" ? 24 : -24,
                            y: 10,
                          }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          exit={{
                            opacity: 0,
                            x: line.sender === "you" ? 16 : -16,
                            y: -12,
                          }}
                          transition={{ duration: 0.55, ease: "easeInOut" }}
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs font-mono leading-relaxed ${
                            line.sender === "you"
                              ? "ml-auto bg-foreground text-background"
                              : "bg-background border border-red-500/25 text-red-700"
                          }`}
                        >
                          {line.text}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {chatStep < chatLines.length && (
                      <motion.div
                        key={`typing-row-${typingSender}-${chatStep}`}
                        layout
                        initial={{
                          opacity: 0,
                          x: typingSender === "you" ? 24 : -24,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className={`flex w-full ${
                          typingSender === "you"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <motion.div
                          animate={{ opacity: [0.35, 1, 0.35] }}
                          transition={{
                            duration: 1.35,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/25 bg-background px-3 py-1 text-[10px] font-mono text-red-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" />
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" />
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" />
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>

                  {shouldScrollTranscript && (
                    <>
                      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 bg-gradient-to-b from-background to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t from-background to-transparent" />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
