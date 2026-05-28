import { PatentSearchApiClient } from "../api/client.js";

export const claimsTool = {
  name: "claims",
  description:
    "Fetch just the claims of a patent — the legal scope of the invention, formatted as a numbered list of independent and dependent claims. " +
    "Much cheaper than `dossier` for LLM token budgets when you only need claim text. " +
    "Free when the patent's dossier is already in the 24h cache. Cold fetch costs 1 credit (no AI work, just a Google Patents fetch). " +
    "Prefer this over `dossier` when you don't also need bibliographic data, citations, or family.",
  inputSchema: {
    type: "object",
    properties: {
      patentNumber: {
        type: "string",
        description:
          "Publication number in canonical form (e.g. US10867416B2). Loose input like '10,867,416' is normalized.",
      },
    },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface ClaimsResponse {
  patentNumber: string;
  claims: {
    totalCount: number;
    independentNumbers: number[];
    items: Array<{
      number: number;
      text: string;
      isIndependent: boolean;
      dependsOn?: number;
    }>;
  };
  cached: boolean;
}

export async function runClaims(
  api: PatentSearchApiClient,
  args: Record<string, unknown>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent: ClaimsResponse;
}> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");

  const data = await api.post<ClaimsResponse>("/claims", { patentNumber });

  const lines: string[] = [
    `${data.patentNumber} — ${data.claims.totalCount} claims (${data.claims.independentNumbers.length} independent)`,
    data.cached ? "(served from 24h cache — free)" : "(fresh fetch — 1 credit charged)",
    "",
  ];
  for (const claim of data.claims.items) {
    const marker = claim.isIndependent ? "■" : `└─ (dep. on ${claim.dependsOn ?? "?"})`;
    lines.push(`${marker} Claim ${claim.number}`);
    lines.push(claim.text);
    lines.push("");
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    structuredContent: data,
  };
}
