import { z } from "zod";

export const contextTypeValues = [
  "relationship",
  "job_offer",
  "contract",
  "email",
  "other",
] as const;

export type ContextType = (typeof contextTypeValues)[number];

export const AnalysisSchema = z.object({
  verdict: z.enum(["walk_away", "proceed_with_caution", "looks_fine"]),
  red_flags: z.array(
    z.object({
      flag: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      explanation: z.string(),
    })
  ),
  green_flags: z.array(
    z.object({
      flag: z.string(),
      explanation: z.string(),
    })
  ),
  summary: z.string(),
  recommended_questions: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;
