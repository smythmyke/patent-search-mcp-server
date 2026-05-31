import { PatentSearchApiClient } from "../api/client.js";

export const legalStatusTool = {
  name: "legal_status",
  description:
    "Is this US patent still in force? Returns in-force vs lapsed/expired, the anticipated 20-year expiration, and the " +
    "maintenance-fee payment history (derived from USPTO events). Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US10000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface LegalStatusResponse {
  patentNumber?: string; inForce?: boolean | null; statusLabel?: string;
  anticipatedExpiration?: string; lastMaintenancePayment?: string;
  lapseOrExpirationEvent?: { date: string; description: string } | null;
}

export async function runLegalStatus(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: LegalStatusResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<LegalStatusResponse>("/legal-status", { patentNumber });
  const lines = [
    `${d.patentNumber ?? patentNumber}: ${d.inForce === true ? "IN FORCE" : d.inForce === false ? "NOT in force" : "status unknown"} (${d.statusLabel ?? "?"})`,
    d.anticipatedExpiration ? `Anticipated expiration: ${d.anticipatedExpiration}` : null,
    d.lastMaintenancePayment ? `Last maintenance-fee payment: ${d.lastMaintenancePayment}` : null,
    d.lapseOrExpirationEvent ? `Lapse/expiry: ${d.lapseOrExpirationEvent.date} ${d.lapseOrExpirationEvent.description}` : null,
  ].filter((s): s is string => s !== null);
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: d };
}
