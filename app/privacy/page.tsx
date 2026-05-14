import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen noise-overlay">
      <Navigation />
      <section className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            Privacy
          </span>
          <h1 className="mt-6 text-4xl lg:text-6xl font-display tracking-tight">
            Privacy policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Short version: you own your data. We keep it only as long as it’s
            useful to you.
          </p>

          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <p>Anonymous analyses are intended to auto-delete after 7 days.</p>
            <p>
              Logged-in analyses stay in your account until you delete them.
            </p>
          </div>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
