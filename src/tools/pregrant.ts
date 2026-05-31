import { PatentSearchApiClient } from "../api/client.js";

export const pregrantTool = {
  name: "pregrant_pub",
  description:
    "The pre-grant publication (as-filed) for a US patent: publication number/date plus the as-filed abstract and claims " +
    "parsed from the application XML. Useful for comparing as-filed vs as-granted claim scope. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US10000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface PregrantResponse {
  patentNumber?: string; publicationNumber?: string; publicationDate?: string;
  asFiledClaimCount?: number; asFiledAbstract?: string;
  asFiledClaims?: Array<{ number: number; text: string; isIndependent: boolean }>;
}

export async function runPregrant(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: PregrantResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<PregrantResponse>("/pregrant-pub", { patentNumber });
  const lines = [
    `Pre-grant publication: ${d.publicationNumber || "none"}${d.publicationDate ? ` (${d.publicationDate})` : ""}`,
    `As-filed claims: ${d.asFiledClaimCount ?? 0}`,
    d.asFiledAbstract ? `Abstract: ${d.asFiledAbstract.slice(0, 280)}` : "",
  ].filter(Boolean);
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: d };
}
