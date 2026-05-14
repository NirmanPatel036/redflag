import Link from "next/link";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden noise-overlay">
      <Navigation />

      <section className="relative min-h-screen pt-32 pb-24 flex items-center">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {[...Array(8)].map((_, index) => (
            <div
              key={`not-found-line-${index}`}
              className="absolute h-px bg-foreground/10"
              style={{
                top: `${12.5 * (index + 1)}%`,
                left: 0,
                right: 0,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <span className="w-8 h-px bg-red-500/70" />
              Missing page
            </span>

            <h1 className="mt-8 text-5xl lg:text-7xl font-display tracking-tight leading-none">
              This link looks
              <br />
              <span className="text-muted-foreground">like a red flag.</span>
            </h1>

            <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              The page you’re looking for does not exist, moved, or was never
              real in the first place.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90"
              >
                <Link href="/#hero">
                  <Search className="mr-2 h-4 w-4" />
                  Analyze something
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-foreground/20 px-6"
              >
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
