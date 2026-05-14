"use client";

import { AnimatedWave } from "./animated-wave";

const footerLinks = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Privacy", href: "/privacy" },
  { name: "GitHub", href: "https://www.github.com/NirmanPatel036/redflag" },
  { name: "Developer", href: "https://nirmanhere.vercel.app" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/nirmanpatel" },
];

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 h-64 opacity-20 pointer-events-none overflow-hidden">
        <AnimatedWave />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-20 flex flex-col md:flex-row gap-10 md:items-center md:justify-between">
          <div>
            <a href="#hero" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-display">Red Flag Catcher</span>
            </a>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Honest opinions. No feelings hurt (not our problem).
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                target={link.href.startsWith("http") ? "_blank" : undefined}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Made for 🫵🏻 by Nirman Patel. 2026. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono">No sugarcoating enabled.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
