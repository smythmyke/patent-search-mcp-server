import { PatentSearchApiClient } from "../api/client.js";

export const assignmentsTool = {
  name: "assignments",
  description:
    "Chain of title for a US patent: who owns it now and the recorded assignment history (conveyances, reel/frame, " +
    "assignor → assignee, dates). Useful for ownership/licensing and M&A due diligence. Free, public-record.",
  inputSchema: {
    type: "object",
    properties: { patentNumber: { type: "string", description: "US patent number (e.g. US10000000B2)." } },
    required: ["patentNumber"],
    additionalProperties: false,
  },
} as const;

interface AssignmentsResponse {
  patentNumber?: string; currentAssignee?: string; assignmentCount?: number;
  assignments?: Array<{ reelFrame: string; conveyanceText: string; recordedDate: string; assignors: Array<{ name: string }>; assignees: string[] }>;
}

export async function runAssignments(
  api: PatentSearchApiClient, args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; structuredContent: AssignmentsResponse }> {
  const patentNumber = typeof args.patentNumber === "string" ? args.patentNumber : "";
  if (!patentNumber) throw new Error("patentNumber is required");
  const d = await api.post<AssignmentsResponse>("/assignments", { patentNumber });
  const lines = [
    `Current assignee: ${d.currentAssignee || "unknown"} — ${d.assignmentCount ?? 0} recorded assignment(s)`,
    ...(d.assignments ?? []).slice(0, 15).map((a) => `  ${a.recordedDate} ${a.reelFrame} "${a.conveyanceText}" — ${a.assignors.map((x) => x.name).join(", ")} → ${a.assignees.join(", ")}`),
  ];
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: d };
}
