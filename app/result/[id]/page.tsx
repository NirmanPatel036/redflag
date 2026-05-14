"use client";

import { use, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AnalysisResult } from "@/lib/analysis";
import {
  Check,
  Copy,
  Download,
  FileImage,
  FileType,
  Linkedin,
  Mail,
  Share2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

type ResultPageProps = {
  params: Promise<{ id: string }>;
};

type AnalysisItem = {
  id: string;
  context_type: string;
  verdict: string;
  result: AnalysisResult;
  input_text: string;
  created_at: string;
  is_anonymous: boolean;
};

const verdictLabels: Record<string, string> = {
  walk_away: "WALK AWAY",
  proceed_with_caution: "PROCEED WITH CAUTION",
  looks_fine: "LOOKS FINE",
};

const severityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-foreground/10 text-foreground/70 border-foreground/20",
  low: "bg-foreground/5 text-foreground/60 border-foreground/10",
};

export default function ResultPage({ params }: ResultPageProps) {
  const { id } = use(params);
  const containerRef = useRef<HTMLDivElement>(null);
  const [analysis, setAnalysis] = useState<AnalysisItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [shouldBlur, setShouldBlur] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        setIsAuthed(Boolean(accessToken));

        const response = await fetch(`/api/analysis/${id}`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload?.error || "Failed to load analysis.");
        }

        const payload = await response.json();
        setAnalysis(payload.item ?? null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something broke.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  useEffect(() => {
    if (!analysis?.is_anonymous) {
      setShouldBlur(false);
      return;
    }

    const storageKey = "rf_viewed_results";
    try {
      const raw = window.localStorage.getItem(storageKey);
      const viewed = raw ? (JSON.parse(raw) as string[]) : [];
      if (viewed.includes(analysis.id)) {
        setShouldBlur(true);
      } else {
        const next = [...viewed, analysis.id];
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        setShouldBlur(false);
      }
    } catch {
      setShouldBlur(true);
    }
  }, [analysis]);

  const verdictLabel = useMemo(() => {
    if (!analysis) return "";
    return verdictLabels[analysis.verdict] ?? analysis.verdict.toUpperCase();
  }, [analysis]);

  const shareText = useMemo(() => {
    if (!analysis) return "Check this Red Flag Catcher result.";
    return `Red Flag Catcher verdict: ${verdictLabel}. ${analysis.result.summary}`;
  }, [analysis, verdictLabel]);

  const encodedShareText = encodeURIComponent(shareText);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Red Flag Catcher verdict",
          text: shareText,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    await handleCopyResult();
  };

  const handleCopyResult = async () => {
    if (!shareText) return;

    await navigator.clipboard.writeText(shareText);
    setCopyStatus("copied");
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const handleDownloadPNG = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "oklch(0.985 0.002 90)",
        style: {
          "--background": "oklch(0.985 0.002 90)",
          "--foreground": "oklch(0.12 0.01 60)",
          "--card": "oklch(1 0 0)",
          "--card-foreground": "oklch(0.12 0.01 60)",
          "--popover": "oklch(1 0 0)",
          "--popover-foreground": "oklch(0.12 0.01 60)",
          "--primary": "oklch(0.12 0.01 60)",
          "--primary-foreground": "oklch(0.985 0.002 90)",
          "--secondary": "oklch(0.96 0.005 90)",
          "--secondary-foreground": "oklch(0.12 0.01 60)",
          "--muted": "oklch(0.94 0.005 90)",
          "--muted-foreground": "oklch(0.45 0.02 60)",
          "--accent": "oklch(0.92 0.01 90)",
          "--accent-foreground": "oklch(0.12 0.01 60)",
          "--border": "oklch(0.88 0.01 90)",
          "--input": "oklch(0.92 0.01 90)",
          "--ring": "oklch(0.12 0.01 60)",
        } as any,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `red-flag-analysis-${id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate PNG:", err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "oklch(0.985 0.002 90)",
        style: {
          "--background": "oklch(0.985 0.002 90)",
          "--foreground": "oklch(0.12 0.01 60)",
          "--card": "oklch(1 0 0)",
          "--card-foreground": "oklch(0.12 0.01 60)",
          "--popover": "oklch(1 0 0)",
          "--popover-foreground": "oklch(0.12 0.01 60)",
          "--primary": "oklch(0.12 0.01 60)",
          "--primary-foreground": "oklch(0.985 0.002 90)",
          "--secondary": "oklch(0.96 0.005 90)",
          "--secondary-foreground": "oklch(0.12 0.01 60)",
          "--muted": "oklch(0.94 0.005 90)",
          "--muted-foreground": "oklch(0.45 0.02 60)",
          "--accent": "oklch(0.92 0.01 90)",
          "--accent-foreground": "oklch(0.12 0.01 60)",
          "--border": "oklch(0.88 0.01 90)",
          "--input": "oklch(0.92 0.01 90)",
          "--ring": "oklch(0.12 0.01 60)",
        } as any,
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const margin = 40; // px
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeightOnPdf =
        (imgProps.height * printableWidth) / imgProps.width;

      let heightLeft = imgHeightOnPdf;
      let pageNum = 0;

      const bgColor = [253, 252, 251]; // RGB for oklch(0.985 0.002 90)

      while (heightLeft > 0) {
        if (pageNum > 0) pdf.addPage();

        // Calculate position for this page
        const position = margin - pageNum * printableHeight;

        // Add the image
        pdf.addImage(
          dataUrl,
          "PNG",
          margin,
          position,
          printableWidth,
          imgHeightOnPdf,
        );

        // Draw masking rectangles for margins
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);

        // Top margin
        pdf.rect(0, 0, pdfWidth, margin, "F");
        // Bottom margin
        pdf.rect(0, pdfHeight - margin, pdfWidth, margin, "F");
        // Left margin
        pdf.rect(0, 0, margin, pdfHeight, "F");
        // Right margin
        pdf.rect(pdfWidth - margin, 0, margin, pdfHeight, "F");

        heightLeft -= printableHeight;
        pageNum++;
      }

      pdf.save(`red-flag-analysis-${id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  return (
    <main className="relative min-h-screen noise-overlay">
      <Navigation />
      <section className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground whitespace-nowrap">
                  <span className="w-8 h-px bg-foreground/30" />
                  Shareable result
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleNativeShare}
                    className="h-8 w-8 rounded-full hover:bg-foreground/5"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyResult}
                    className="h-8 w-8 rounded-full hover:bg-foreground/5"
                    title={copyStatus === "copied" ? "Copied" : "Copy result"}
                  >
                    {copyStatus === "copied" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-foreground/5"
                  >
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodedShareText}`}
                      target="_blank"
                      rel="noreferrer"
                      title="X"
                    >
                      <XIcon />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-foreground/5"
                  >
                    <a
                      href={`https://wa.me/?text=${encodedShareText}`}
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp"
                    >
                      <WhatsAppIcon />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-foreground/5"
                  >
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?text=${encodedShareText}`}
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-foreground/5"
                  >
                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        "Red Flag Catcher verdict",
                      )}&body=${encodedShareText}`}
                      title="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full hover:bg-foreground/5"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={handleDownloadPNG}>
                        <FileImage className="mr-2 h-4 w-4" />
                        PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadPDF}>
                        <FileType className="mr-2 h-4 w-4" />
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h1 className="mt-6 text-4xl lg:text-6xl font-display tracking-tight">
                Verdict
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {analysis
                  ? "Here’s the blunt breakdown."
                  : "Pulling the analysis now."}
              </p>
            </div>
            <Button
              asChild
              className="bg-foreground text-background rounded-full h-12 px-6"
            >
              <Link href="/">Analyze another</Link>
            </Button>
          </div>

          {isLoading && (
            <div className="mt-12 border border-foreground/10 p-6 text-sm text-muted-foreground">
              Loading analysis…
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="mt-12 border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {!isLoading && analysis && (
            <div
              ref={containerRef}
              className="mt-12 border border-foreground/10 bg-background"
            >
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  Analysis ID
                </span>
                <span className="text-xs font-mono text-foreground/70">
                  {analysis.id}
                </span>
              </div>
              <div className="p-6 space-y-8">
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-2">
                    Verdict
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-mono bg-foreground text-background">
                    {verdictLabel}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-2">
                    Input
                  </div>
                  <p className="text-sm text-muted-foreground border border-foreground/10 p-4">
                    {analysis.input_text}
                  </p>
                </div>

                <div
                  className={
                    shouldBlur ? "blur-sm pointer-events-none select-none" : ""
                  }
                >
                  <div className="text-xs font-mono text-muted-foreground mb-3">
                    Red flags
                  </div>
                  <div className="space-y-3">
                    {analysis.result.red_flags.map((flag, index) => (
                      <div
                        key={`${flag.flag}-${index}`}
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

                  <div className="mt-6">
                    <div className="text-xs font-mono text-muted-foreground mb-3">
                      Green flags
                    </div>
                    <div className="space-y-3">
                      {analysis.result.green_flags.map((flag, index) => (
                        <div
                          key={`${flag.flag}-${index}`}
                          className="border border-foreground/10 p-4"
                        >
                          <p className="font-medium text-foreground/90">
                            {flag.flag}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {flag.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-xs font-mono text-muted-foreground mb-3">
                      Summary
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {analysis.result.summary}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="text-xs font-mono text-muted-foreground mb-3">
                      Recommended questions
                    </div>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                      {analysis.result.recommended_questions.map(
                        (question, index) => (
                          <li key={`${question}-${index}`}>{question}</li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                {analysis.is_anonymous && (
                  <div className="pt-4 border-t border-foreground/10">
                    <p className="text-xs text-muted-foreground font-mono">
                      Anonymous results blur after the first view.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAuthed && (
            <p className="mt-6 text-xs text-muted-foreground font-mono">
              Want this to stay clear? Log in before you analyze.
            </p>
          )}
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
