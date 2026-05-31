import { PatentSearchApiClient } from "../api/client.js";

export const termTool = {
  name: "term",
  description:
    "Patent Term Adjustment (PTA) and the resulting adjusted expiration for a US patent: base 20-year expiration, total " +
    "PTA days, the adjusted expiration, and the A/B/C delay breakdown. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US8000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface TermResponse {
  patentNumber?: string; baseExpiration?: string; ptaAdjustmentDays?: number; adjustedExpiration?: string;
  delayBreakdown?: { usptoADelay: number; usptoBDelay: number; usptoCDelay: number; applicantDelay: number };
}

export async function runTerm(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: TermResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<TermResponse>("/term", { patentNumber });
  const b = d.delayBreakdown;
  const lines = [
    `${d.patentNumber ?? patentNumber}: base ${d.baseExpiration ?? "?"} + ${d.ptaAdjustmentDays ?? 0} PTA days → adjusted expiration ${d.adjustedExpiration ?? "?"}`,
    b ? `Delays — USPTO A:${b.usptoADelay} B:${b.usptoBDelay} C:${b.usptoCDelay}; applicant:${b.applicantDelay}` : "",
  ].filter(Boolean);
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: d };
}
