import { PatentSearchApiClient } from "../api/client.js";

export const attorneyTool = {
  name: "attorney",
  description:
    "Attorneys/agents of record for a US patent (name + USPTO registration number), plus the docket number and customer " +
    "number. Useful for competitive intel — who prosecutes for this assignee. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US10000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface AttorneyResponse {
  patentNumber?: string; customerNumber?: string; docketNumber?: string; attorneyCount?: number;
  attorneys?: Array<{ name: string; registrationNumber: string; active: boolean }>;
}

export async function runAttorney(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: AttorneyResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<AttorneyResponse>("/attorney", { patentNumber });
  const att = (d.attorneys ?? []).filter((a) => a.active);
  const lines = [
    `${d.attorneyCount ?? 0} attorney(s) of record` + (d.docketNumber ? ` — docket ${d.docketNumber}` : ""),
    ...att.slice(0, 15).map((a) => `  ${a.name} (Reg. #${a.registrationNumber})`),
  ];
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: d };
}
