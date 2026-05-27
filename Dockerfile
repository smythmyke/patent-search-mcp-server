# Dockerfile for Glama (and any other MCP-server CI) automated checks.
#
# This is NOT how end users run the server — they install via
# `npx -y patent-search-mcp-server` in their MCP client config. This image
# exists solely so Glama / other validators can:
#   1. Verify the binary builds and starts
#   2. Exercise the MCP `initialize` and `tools/list` handshake
#   3. Confirm there are no malicious behaviors
#
# The placeholder PATENT_SEARCH_API_KEY below is enough for the server to
# start and respond to protocol-level requests. Any actual tool call requires
# a real key minted from the AI Patent Search Generator Chrome extension's
# Admin tab.

FROM node:20-alpine

LABEL org.opencontainers.image.source="https://github.com/smythmyke/patent-search-mcp-server"
LABEL org.opencontainers.image.description="Patent Search MCP server — patent dossiers, prosecution history, citation graphs, and Google Patents search"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Install the published npm package globally so the `patent-search-mcp-server`
# binary is on PATH.
RUN npm install -g patent-search-mcp-server@latest

# Placeholder so the server starts. Real API keys come from users; this
# value never reaches the AI Patent Search Generator backend (it'd fail
# auth there anyway).
ENV PATENT_SEARCH_API_KEY=placeholder-for-ci-validation

# The MCP server speaks JSON-RPC over stdio.
ENTRYPOINT ["patent-search-mcp-server"]
