import { PatentSearchApiClient } from "../api/client.js";

export const companyLitigationTool = {
  name: "company_litigation",
  description:
    "Reverse lookup: given a COMPANY name, return all US district-court patent suits it was involved in (as plaintiff or " +
    "defendant), with the patents, opposing parties, court, and cause. Great for competitive intel / M&A due diligence " +
    "('is this company a patent troll or heavily sued?'). If no exact match, returns name suggestions. Coverage 2003-2020.",
  inputSchema: {
    type: "object",
    properties: {
      company: { type: "string", description: "Company name (e.g. 'Apple', 'Samsung Electronics')." },
      limit: { type: "number", description: "Max cases to return (default 100)." },
    },
    required: ["company"],
    additionalProperties: false,
  },
} as const;

interface CompanyLitigationResponse {
  query?: string; matchedName?: string; displayNames?: string[];
  caseCount?: number; asPlaintiffCount?: number; asDefendantCount?: number;
  cases?: Array<{ role: string; caseNumber: string; court: string; dateFiled: string; cause: string; patents: string[]; opposing: string[] }>;
  related?: Array<{ name: string; caseCount: number }>;
  suggestions?: Array<{ name: string; caseCount: number }>;
}

export async function runCompanyLitigation(
  api: PatentSearchApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: CompanyLitigationResponse }> {
  const company = typeof args.company === "string" ? args.company : "";
  if (!company) throw new Error("company is required");
  const body: Record<string, unknown> = { company };
  if (typeof args.limit === "number") body.limit = args.limit;
  const data = await api.post<CompanyLitigationResponse>("/company-litigation", body);

  let lines: string[];
  if (data.matchedName) {
    lines = [
      `${data.matchedName} — ${data.caseCount ?? 0} suit(s) (plaintiff ${data.asPlaintiffCount ?? 0}, defendant ${data.asDefendantCount ?? 0})`,
      ...(data.cases ?? []).slice(0, 20).map((c) => `  ${c.dateFiled} ${c.role} vs ${c.opposing.join("; ") || "?"} — patents ${c.patents.join(", ")} — ${c.cause}`),
    ];
    if (data.related?.length) lines.push(`Related entities: ${data.related.map((r) => `${r.name}(${r.caseCount})`).join(", ")}`);
  } else {
    lines = [
      `No exact match for "${company}".`,
      ...(data.suggestions?.length ? [`Suggestions: ${data.suggestions.map((s) => `${s.name}(${s.caseCount})`).join(", ")}`] : ["No matching companies in the repeat-litigant index."]),
    ];
  }
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: data };
}
