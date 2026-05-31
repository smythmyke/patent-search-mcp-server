import { PatentSearchApiClient } from "../api/client.js";

export const challengesTool = {
  name: "challenges",
  description:
    "Get the PTAB validity-challenge history for a US patent: who challenged it (petitioner), the patent owner, " +
    "challenge type (IPR/PGR/CBM), filing/institution dates, and outcome (patent_survived / final_written_decision / " +
    "terminated). Answers 'was this patent attacked at the PTAB, by whom, and did it survive?'. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: {
      patentNumber: { type: "string", description: "US patent number (e.g. US8724622B2)." },
    },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface ChallengesResponse {
  patentNumber?: string;
  challengeCount?: number;
  challenges?: Array<{
    trialNumber: string; type: string; petitioner: string; patentOwner: string;
    petitionFilingDate: string; status: string; outcome: string;
  }>;
}

export async function runChallenges(
  api: PatentSearchApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: ChallengesResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const data = await api.post<ChallengesResponse>("/challenges", { patentNumber });
  const c = data.challenges ?? [];
  const lines = [
    `${data.challengeCount ?? 0} PTAB challenge(s) for ${data.patentNumber ?? patentNumber}`,
    ...c.slice(0, 25).map((t) => `  ${t.trialNumber} (${t.type}) — ${t.petitioner} v ${t.patentOwner} — ${t.status} → ${t.outcome}`),
  ];
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: data };
}
