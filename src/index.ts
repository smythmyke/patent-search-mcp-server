#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { PatentSearchApiClient, PatentSearchApiError } from "./api/client.js";
import { balanceTool, runBalance } from "./tools/balance.js";
import { dossierTool, runDossier } from "./tools/dossier.js";
import { prosecutionTool, runProsecution } from "./tools/prosecution.js";
import { oaAnalyzeTool, runOaAnalyze } from "./tools/oaAnalyze.js";
import { examinerTool, runExaminer } from "./tools/examiner.js";
import { queryTool, runQuery } from "./tools/query.js";
import { searchTool, runSearch } from "./tools/search.js";
import { similarTool, runSimilar } from "./tools/similar.js";
import { citationsTool, runCitations } from "./tools/citations.js";
import { familyTool, runFamily } from "./tools/family.js";
import { cpcTool, runCpc } from "./tools/cpc.js";
import { claimChartTool, runClaimChart } from "./tools/claimChart.js";
import { claimsTool, runClaims } from "./tools/claims.js";
import { cpcSuggestTool, runCpcSuggest } from "./tools/cpcSuggest.js";
import { challengesTool, runChallenges } from "./tools/challenges.js";
import { legalStatusTool, runLegalStatus } from "./tools/legalStatus.js";
import { assignmentsTool, runAssignments } from "./tools/assignments.js";
import { termTool, runTerm } from "./tools/term.js";
import { prosecutionTimelineTool, runProsecutionTimeline } from "./tools/prosecutionTimeline.js";
import { attorneyTool, runAttorney } from "./tools/attorney.js";
import { entityStatusTool, runEntityStatus } from "./tools/entityStatus.js";
import { pregrantTool, runPregrant } from "./tools/pregrant.js";
import { litigationTool, runLitigation } from "./tools/litigation.js";
import { companyLitigationTool, runCompanyLitigation } from "./tools/companyLitigation.js";

const SERVER_NAME = "patent-search";
const SERVER_VERSION = "0.3.0";

function readEnv(name: string, required = true): string {
  const value = process.env[name];
  if (!value && required) {
    process.stderr.write(
      `[patent-search-mcp] ${name} is not set. Mint a key from the AI Patent Search Generator Chrome extension's Admin tab and set it in your MCP client config.\n`
    );
    process.exit(1);
  }
  return value ?? "";
}

async function main(): Promise<void> {
  const apiKey = readEnv("PATENT_SEARCH_API_KEY");
  const baseUrl = process.env.PATENT_SEARCH_API_BASE;

  const api = new PatentSearchApiClient({ apiKey, baseUrl });

  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  const tools: Tool[] = [
    balanceTool as unknown as Tool,
    dossierTool as unknown as Tool,
    prosecutionTool as unknown as Tool,
    oaAnalyzeTool as unknown as Tool,
    examinerTool as unknown as Tool,
    queryTool as unknown as Tool,
    searchTool as unknown as Tool,
    similarTool as unknown as Tool,
    citationsTool as unknown as Tool,
    familyTool as unknown as Tool,
    cpcTool as unknown as Tool,
    claimChartTool as unknown as Tool,
    claimsTool as unknown as Tool,
    cpcSuggestTool as unknown as Tool,
    challengesTool as unknown as Tool,
    legalStatusTool as unknown as Tool,
    assignmentsTool as unknown as Tool,
    termTool as unknown as Tool,
    prosecutionTimelineTool as unknown as Tool,
    attorneyTool as unknown as Tool,
    entityStatusTool as unknown as Tool,
    pregrantTool as unknown as Tool,
    litigationTool as unknown as Tool,
    companyLitigationTool as unknown as Tool,
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case balanceTool.name:    return await runBalance(api);
        case dossierTool.name:    return await runDossier(api, args ?? {});
        case prosecutionTool.name: return await runProsecution(api, args ?? {});
        case oaAnalyzeTool.name:  return await runOaAnalyze(api, args ?? {});
        case examinerTool.name:   return await runExaminer(api, args ?? {});
        case queryTool.name:      return await runQuery(api, args ?? {});
        case searchTool.name:     return await runSearch(api, args ?? {});
        case similarTool.name:    return await runSimilar(api, args ?? {});
        case citationsTool.name:  return await runCitations(api, args ?? {});
        case familyTool.name:     return await runFamily(api, args ?? {});
        case cpcTool.name:        return await runCpc(api, args ?? {});
        case claimChartTool.name: return await runClaimChart(api, args ?? {});
        case claimsTool.name:     return await runClaims(api, args ?? {});
        case cpcSuggestTool.name: return await runCpcSuggest(api, args ?? {});
        case challengesTool.name: return await runChallenges(api, args ?? {});
        case legalStatusTool.name: return await runLegalStatus(api, args ?? {});
        case assignmentsTool.name: return await runAssignments(api, args ?? {});
        case termTool.name:       return await runTerm(api, args ?? {});
        case prosecutionTimelineTool.name: return await runProsecutionTimeline(api, args ?? {});
        case attorneyTool.name:   return await runAttorney(api, args ?? {});
        case entityStatusTool.name: return await runEntityStatus(api, args ?? {});
        case pregrantTool.name:   return await runPregrant(api, args ?? {});
        case litigationTool.name: return await runLitigation(api, args ?? {});
        case companyLitigationTool.name: return await runCompanyLitigation(api, args ?? {});
        default:
          return errorResult(`Unknown tool: ${name}`);
      }
    } catch (err) {
      if (err instanceof PatentSearchApiError) {
        return errorResult(err.message);
      }
      const message = err instanceof Error ? err.message : String(err);
      return errorResult(message);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function errorResult(message: string): {
  isError: true;
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

main().catch((err) => {
  process.stderr.write(
    `[patent-search-mcp] Fatal: ${err instanceof Error ? err.message : String(err)}\n`
  );
  process.exit(1);
});
