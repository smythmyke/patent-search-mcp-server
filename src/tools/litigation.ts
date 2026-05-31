import { PatentSearchApiClient } from "../api/client.js";

export const litigationTool = {
  name: "litigation",
  description:
    "Get the US district-court infringement litigation history for a patent: who sued whom, in which court, over what " +
    "(cause of action), with filing dates. Backed by the USPTO Patent Litigation Dataset. Coverage: comprehensive " +
    "2003-2016, partial to 2020 (no cases after 2020). Empty result = not litigated on record. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: {
      patentNumber: { type: "string", description: "US patent number (e.g. US8724622B2)." },
      limit: { type: "number", description: "Max cases to return (default: all stored)." },
    },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface LitigationResponse {
  patentNumber?: string;
  caseCount?: number;
  cases?: Array<{
    caseNumber: string; court: string; dateFiled: string; caseName: string;
    plaintiffs: string[]; defendants: string[]; cause: string;
  }>;
  truncated?: boolean;
  coverageNote?: string;
}

export async function runLitigation(
  api: PatentSearchApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: LitigationResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const body: Record<string, unknown> = { patentNumber };
  if (typeof args.limit === "number") body.limit = args.limit;
  const data = await api.post<LitigationResponse>("/litigation", body);
  const cs = data.cases ?? [];
  const lines = [
    `${data.caseCount ?? 0} district-court suit(s) for ${data.patentNumber ?? patentNumber}` + (data.truncated ? " (truncated)" : ""),
    ...cs.slice(0, 25).map((c) => `  ${c.dateFiled} ${c.caseNumber} (${c.court}) — ${(c.plaintiffs[0] || c.caseName)} v ${(c.defendants[0] || "?")} — ${c.cause}`),
  ];
  if (data.coverageNote) lines.push(`Note: ${data.coverageNote}`);
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: data };
}
