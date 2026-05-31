import { PatentSearchApiClient } from "../api/client.js";

export const entityStatusTool = {
  name: "entity_status",
  description:
    "USPTO entity status for a US patent (small / micro / large entity) — a signal of the applicant's size and fee tier. " +
    "Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US10000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface EntityStatusResponse { patentNumber?: string; smallEntity?: boolean; category?: string }

export async function runEntityStatus(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: EntityStatusResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<EntityStatusResponse>("/entity-status", { patentNumber });
  return {
    content: [{ type: "text", text: `${d.patentNumber ?? patentNumber}: ${d.category || (d.smallEntity ? "small entity" : "large entity")}` }],
    structuredContent: d,
  };
}
