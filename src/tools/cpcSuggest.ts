import { PatentSearchApiClient } from "../api/client.js";

export const cpcSuggestTool = {
  name: "cpc_suggest",
  description:
    "Suggest CPC (Cooperative Patent Classification) codes from a plain-English description of a technology or invention. " +
    "Returns 3-5 candidate codes ranked by confidence with reasoning. " +
    "Use this when you have a product or invention description and want to know which CPC codes to use in patent searches. " +
    "Costs 1 credit; repeated calls on the same description are cached for 30 days. " +
    "Coverage note: the curated dataset (~80 common subclasses) covers most software, hardware, and mechanical tech well but may miss niche chemistry/biotech. " +
    "For looking UP a known code's meaning, use the `cpc` tool instead.",
  inputSchema: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description:
          "Plain-English description of the technology or invention. 5-2000 characters. More technical detail yields better suggestions. " +
          "Examples: 'lithium-ion battery thermal management system', 'machine learning model for fraud detection in payments', 'foldable smartphone hinge mechanism'.",
      },
    },
    required: ["description"],
    additionalProperties: false,
  },
} as const;

interface CpcSuggestResponse {
  description: string;
  suggestions: Array<{
    code: string;
    title: string;
    confidence: "high" | "medium" | "low";
    reasoning: string;
  }>;
  cached: boolean;
  notes?: string;
}

export async function runCpcSuggest(
  api: PatentSearchApiClient,
  args: Record<string, unknown>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent: CpcSuggestResponse;
}> {
  const description = typeof args.description === "string" ? args.description : "";
  if (!description) throw new Error("description is required");

  const data = await api.post<CpcSuggestResponse>("/cpc-suggest", { description });

  const lines: string[] = [
    `CPC suggestions for: "${description.length > 80 ? description.slice(0, 77) + "..." : description}"`,
    data.cached ? "(served from cache — free)" : "(fresh AI — 1 credit charged)",
    "",
  ];
  if (data.suggestions.length === 0) {
    lines.push("No good matches in the curated dataset.");
  } else {
    for (const s of data.suggestions) {
      lines.push(`[${s.confidence.toUpperCase()}] ${s.code} — ${s.title}`);
      if (s.reasoning) lines.push(`  ${s.reasoning}`);
      lines.push("");
    }
  }
  if (data.notes) {
    lines.push(`Notes: ${data.notes}`);
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    structuredContent: data,
  };
}
