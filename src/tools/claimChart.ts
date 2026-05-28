import { PatentSearchApiClient } from "../api/client.js";

export const claimChartTool = {
  name: "claim_chart",
  description:
    "Build a per-claim element chart for a granted US patent. Decomposes each independent claim into discrete elements (preamble, body parts) and maps each element to examiner-cited prior art from cached Office Action analyses. " +
    "Free when the patent's dossier is already in the 24h cache. Cold dossier fetch costs 3 credits (same as the `dossier` tool). " +
    "If you also need bibliographic data, citations, or family, prefer `dossier` first — its result is also cached and makes a subsequent `claim_chart` call free. " +
    "Uses only cached Office Action analyses; to add fresh OA data, call `oa_analyze` first.",
  inputSchema: {
    type: "object",
    properties: {
      patentNumber: {
        type: "string",
        description:
          "Publication number in canonical form (e.g. US10867416B2). Loose input like '10,867,416' is normalized.",
      },
      oaDocumentIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Optional. Restrict the chart to specific Office Action document IDs. If omitted, all cached OAs for this application are used.",
      },
    },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface ClaimChartElement {
  label: string;
  text: string;
  citedReferences: Array<{
    patentNumber: string;
    rejectionStatute: string;
    examinerReasoning: string;
  }>;
}

interface ClaimChartItem {
  claimNumber: number;
  isIndependent: boolean;
  dependsOn?: number;
  elements: ClaimChartElement[];
  status: string;
  statusReasoning: string;
}

interface ClaimChartResponse {
  patentNumber: string;
  generatedAt: string;
  cached: boolean;
  claimCharts: ClaimChartItem[];
  analyzedOaCount: number;
}

export async function runClaimChart(
  api: PatentSearchApiClient,
  args: Record<string, unknown>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent: ClaimChartResponse;
}> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");

  const body: Record<string, unknown> = { patentNumber };
  if (Array.isArray(args.oaDocumentIds)) {
    body.oaDocumentIds = args.oaDocumentIds.filter((s): s is string => typeof s === "string");
  }

  const data = await api.post<ClaimChartResponse>("/claim-chart", body);
  const independents = data.claimCharts.filter((c) => c.isIndependent);

  const lines: string[] = [
    `${data.patentNumber} — claim chart (${independents.length} independent claims, ${data.analyzedOaCount} OAs analyzed)`,
    data.cached ? "(served from 24h cache — free)" : "(fresh — may have included a 3-credit dossier fetch)",
    "",
  ];
  for (const claim of independents) {
    lines.push(`Claim ${claim.claimNumber} — ${claim.status}`);
    if (claim.statusReasoning) lines.push(`  ${claim.statusReasoning}`);
    for (const el of claim.elements) {
      const refs = el.citedReferences.length === 0 ? "no cited art" :
        el.citedReferences.map((r) => `${r.patentNumber} (§${r.rejectionStatute})`).join(", ");
      lines.push(`  [${el.label}] ${refs}`);
    }
    lines.push("");
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    structuredContent: data,
  };
}
