# patent-search-mcp-server

[![npm version](https://img.shields.io/npm/v/patent-search-mcp-server.svg)](https://www.npmjs.com/package/patent-search-mcp-server)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-active-2da44e)](https://registry.modelcontextprotocol.io/v0/servers?search=patent-search)
[![Glama](https://img.shields.io/badge/Glama-listed-blue)](https://glama.ai/mcp/servers/smythmyke/patent-search-mcp-server)
[![smithery badge](https://smithery.ai/badge/smythmyke/patent-search-mcp-server)](https://smithery.ai/servers/smythmyke/patent-search-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MCP (Model Context Protocol) server for the **AI Patent Search Generator** — patent dossiers, prosecution history, Office Action AI analysis, citation/family/CPC lookups, and Google Patents search. Works in Claude Code, Claude Desktop, Cursor, ChatGPT-with-MCP, and any other MCP-compatible client.

24 tools available.

- **Patent data:** `dossier`, `claims`, `claim_chart`, `prosecution`, `prosecution_timeline`, `oa_analyze`, `examiner`, `attorney`, `entity_status`, `term`, `assignments`, `legal_status`, `pregrant_pub`, `query`, `search`, `similar`, `citations`, `family`, `cpc`, `cpc_suggest`, `balance`.
- **Legal intelligence (new):** `challenges` (PTAB validity challenges — who attacked the patent and did it survive), `litigation` (US district-court infringement suits — who sued whom), `company_litigation` (reverse lookup: all patent suits involving a company).

## Prerequisites

1. Install the AI Patent Search Generator Chrome extension and sign in.
2. Generate an API key from the extension's **Admin** tab.
3. Node.js 18+ (only required for local installs; `npx`-style configs don't need a local install).

## Configure in Claude Code

Add to your MCP config (`~/.claude/mcp.json` or project-scoped `.mcp.json`):

```jsonc
{
  "mcpServers": {
    "patent-search": {
      "command": "npx",
      "args": ["-y", "patent-search-mcp-server"],
      "env": {
        "PATENT_SEARCH_API_KEY": "psg_live_..."
      }
    }
  }
}
```

## Configure in Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```jsonc
{
  "mcpServers": {
    "patent-search": {
      "command": "npx",
      "args": ["-y", "patent-search-mcp-server"],
      "env": { "PATENT_SEARCH_API_KEY": "psg_live_..." }
    }
  }
}
```

## Configure in Cursor

Settings → MCP → Add Server. Same JSON shape as Claude Code.

## Tools

### `balance`
Return current credit balance + subscription status. Free. No arguments.

### `dossier`
Full patent intelligence: bibliographic, claims, citations, family, classifications, similar documents, examiner stats — all bundled. **3 credits on fresh fetch; free on 24h cache hit.**

```
{ "patentNumber": "US10867416B2" }
```

### `prosecution`
USPTO file-wrapper documents (Office Actions, responses, amendments, etc.) for a US patent. Free.

```
{ "patentNumber": "US10867416B2" }  OR  { "applicationNumber": "15912345" }
```

### `oa_analyze`
AI analysis of a USPTO Office Action — rejection grounds, cited prior art, suggested response arguments. **First 5 analyses per application are free; subsequent analyses cost 1 credit each.**

Two forms:
- Auto-pick most recent OA: `{ "patentNumber": "US10867416B2" }`
- Explicit doc: `{ "applicationNumber": "15912345", "documentId": "..." }`

### `examiner`
Examiner name, art unit, total applications, allowance rate, average pendency. Free.

```
{ "patentNumber": "US10867416B2" }
```

### `query`
Single optimized Boolean query string for **manual paste** into Google Patents. Does NOT execute. **1 credit.**

```
{ "description": "foldable display with ultrasonic fingerprint sensor" }
```

### `search`
**Executes** a multi-query patent search against Google Patents server-side and returns ranked, deduplicated hits. **1 credit.**

```
{
  "description": "foldable display with ultrasonic fingerprint sensor",
  "strategy": "telescoping",
  "limit": 20
}
```

Strategies: `telescoping` (3 queries, broad/moderate/narrow), `onion-ring` (layered), `faceted` (concept pairs).

### `similar`
Google Patents' similar-documents ranking for a given patent. Free.

```
{ "patentNumber": "US10867416B2", "limit": 20 }
```

### `citations`
Backward + forward citations for a patent. Each citation flags whether it was examiner-cited. Free.

```
{ "patentNumber": "US10867416B2", "direction": "both" }
```

`direction`: `backward` | `forward` | `both` (default).

### `family`
Patent family — continuations, divisionals, foreign counterparts. Free.

```
{ "patentNumber": "US10867416B2" }
```

### `cpc`
CPC classification code lookup. Free. v1.0 covers all sections + ~80 common subclasses; subgroup descriptions land in v1.2.

```
{ "code": "H01M10/0525" }
```

### `claims` *(new in v0.2.0)*
Just the claims of a patent — much cheaper than `dossier` when you only need claim text. **Free when the dossier is cached; 1 credit cold.**

```
{ "patentNumber": "US10867416B2" }
```

### `claim_chart` *(new in v0.2.0)*
Per-claim element chart: decomposes each independent claim into discrete elements and maps each to examiner-cited prior art from cached Office Action analyses. **Free when dossier is cached; 3 credits cold.** Call `oa_analyze` first if you want fresh OA data included.

```
{ "patentNumber": "US10867416B2", "oaDocumentIds": ["optional-filter"] }
```

### `cpc_suggest` *(new in v0.2.0)*
Description → suggested CPC codes via AI. Returns 3–5 candidates ranked by confidence with reasoning. **1 credit; cached by description hash for 30 days.** Curated dataset (~80 subclasses) — niche chemistry/biotech may miss.

```
{ "description": "lithium-ion battery thermal management with phase change materials" }
```

## Environment variables

| Var | Required | Description |
|---|---|---|
| `PATENT_SEARCH_API_KEY` | yes | API key minted from the extension's Admin tab. Format: `psg_live_...` or `psg_test_...` |
| `PATENT_SEARCH_API_BASE` | no | Override the API base URL. Default: `https://us-central1-solicitation-matcher-extension.cloudfunctions.net/ai/v1` |

## Local development

```bash
git clone https://github.com/smythmyke/patent-search-mcp-server.git
cd patent-search-mcp-server
npm install
npm run build

# Point your MCP client config at the local build:
{
  "command": "node",
  "args": ["/absolute/path/to/patent-search-mcp-server/dist/index.js"],
  "env": { "PATENT_SEARCH_API_KEY": "psg_test_..." }
}
```

## Security

- Never commit `PATENT_SEARCH_API_KEY` to source control.
- Revoke a leaked key from the extension's Admin tab.
- Keys are SHA-256 hashed on the server; the raw key is shown only once at creation.

## Errors

- `Invalid or missing PATENT_SEARCH_API_KEY` — mint or rotate the key.
- `Out of credits` — purchase a credit pack from the extension's Tools tab.
- `Rate limit exceeded` — wait briefly and retry.

## License

MIT
