# Privacy Policy — AI Patent Search Generator

_Last updated: May 27, 2026_

We are committed to protecting your privacy. This policy explains what data the AI Patent Search Generator collects across its Chrome extension, MCP server, public API, and Slack app, how that data is used, and how it is protected.

## 1. Data we collect

- **Account data**: email address (for sign-up / sign-in), Firebase Authentication credentials
- **Billing data**: payment method, transaction history (processed and stored by Stripe — we never see card numbers)
- **Usage data**: search history, generated queries, patent dossiers you have fetched, credit transactions
- **API key metadata**: key prefixes, names, scopes, last-used timestamps (raw key values are stored only as SHA-256 hashes)

## 2. How we use your data

Your data is used only to:

- Authenticate you and route requests to the correct account
- Deduct credits and enforce rate limits
- Serve cached patent data back to you (24-hour cache)
- Process payments through Stripe
- Diagnose issues and improve product quality

We do not sell, rent, or share your data with third parties for marketing purposes.

## 3. Data storage

- **Firestore (Google Cloud)** — account records, credit balances, usage logs, cached patent dossiers, hashed API keys
- **Stripe** — payment methods, charges, invoices (we never store raw card data)
- **Your browser** — search history and preferences (local storage)

## 4. Third-party services

| Service | Purpose |
|---|---|
| Firebase (Google Cloud) | Authentication, data storage, function hosting |
| Stripe | Payment processing |
| Google Gemini API | AI-driven query generation, claim analysis, Office Action analysis |
| Google Patents (public) | Patent metadata, claims, citations, family lookups |
| USPTO Open Data Portal (public) | Prosecution history, examiner statistics |
| Slack (optional) | If you install the Slack app — see section 4.1 |

All third-party services adhere to their own privacy policies.

### 4.1 Slack integration (optional)

If you install the AI Patent Search Generator Slack app in a Slack workspace, we collect only what is needed to run slash commands:

- **Workspace ID and name** — to route slash command requests and label the API key minted for that workspace
- **Slack user ID of the installer** — to link the Slack install to your existing account for credit attribution
- **Bot token** — securely stored in Firestore; used only to post slash command responses back to the same workspace
- **Slash command text** — the patent numbers, descriptions, or CPC codes you pass to commands like `/dossier`, `/patent-search`, etc.

We do **not** read channel messages, direct messages, user profiles beyond the installer's user ID, or files. The Slack OAuth scopes we request are limited to `commands` (receive slash command invocations) and `chat:write` (post responses).

When you uninstall the app from a Slack workspace, the linked API key is automatically revoked and the install record is marked revoked within seconds.

## 5. Data protection

- All data transmission uses HTTPS
- Raw API keys exist only at creation time; we store only SHA-256 hashes
- Firestore security rules restrict reads to authenticated owners
- We never sell or share personal information

## 6. Your rights

You have the right to:

- Access your personal data (via the extension's Admin tab)
- Request data deletion (contact us at the email below)
- Export your data
- Cancel your subscription or revoke API keys at any time

## 7. Data retention

We retain your data while your account is active. Upon account deletion, your personal data is removed from our systems within 30 days, except where legally required to retain it (e.g., financial records for Stripe-processed transactions).

## 8. Updates to this policy

We may update this privacy policy from time to time. Material changes will be announced via the extension or by email to the address on your account.

## Contact

Privacy questions or requests: **smythmyke@gmail.com**

AI Patent Search Generator
