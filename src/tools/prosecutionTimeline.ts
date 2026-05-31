import { PatentSearchApiClient } from "../api/client.js";

export const prosecutionTimelineTool = {
  name: "prosecution_timeline",
  description:
    "Full chronological USPTO event log for a US patent's application (filings, office actions, notices, maintenance " +
    "fees, etc.) — distinct from the 'prosecution' tool which lists file-wrapper documents. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US10000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface TimelineResponse {
  patentNumber?: string; eventCount?: number;
  events?: Array<{ date: string; code: string; description: string }>;
}

export async function runProsecutionTimeline(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: TimelineResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<TimelineResponse>("/prosecution-timeline", { patentNumber });
  const ev = d.events ?? [];
  const lines = [
    `${d.eventCount ?? ev.length} prosecution event(s) for ${d.patentNumber ?? patentNumber}`,
    ...ev.slice(0, 40).map((e) => `  ${e.date} ${e.code} — ${e.description}`),
  ];
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: d };
}
