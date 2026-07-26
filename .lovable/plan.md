## Goal

Add an MCP (Model Context Protocol) server to BDEA so external AI clients (ChatGPT, Claude, Codex, Cursor) can connect as a signed-in BDEA user and read/write that user's incidents. This requires migrating storage from browser `localStorage` to Lovable Cloud (Postgres + Auth) and adding OAuth-based MCP.

> **Trade-off you approved:** this removes the current "no server-side data persistence / GDPR-conscious prototype" property of the app. Incidents will be stored in a managed Postgres database with Row Level Security so each user only sees their own. Worth confirming this is acceptable for the dissertation framing before shipping.

## What will be built

### 1. Backend foundation — Lovable Cloud + Auth
- Enable Lovable Cloud (managed Postgres + Auth).
- Add Email/Password + Google sign-in (Greek/English UI, matching the current EU-institution style).
- Add `/auth` (public sign-in/sign-up) and `/reset-password` routes.
- Add sign-out affordance to the header; render user email when signed in.

### 2. Data model migration
- Create `public.incidents` table mirroring `src/lib/storage.ts` `Incident` type (evidence id, case metadata, officer/witness, device fields, state, circumstances, photo).
- Owner column `user_id uuid references auth.users` + RLS: each user reads/writes only their own rows.
- One-time client-side migration: on first login, offer to upload existing `localStorage` incidents to the user's account.
- Rewrite `src/lib/storage.ts` (and callers: `incident.tsx`, `records.tsx`) to use server functions instead of localStorage. Keep the PDF export and Evidence ID generator unchanged.

### 3. Route gating
- Move `/incident`, `/records`, `/decision` behind `_authenticated/`.
- Keep `/` (dashboard), `/handbook`, and `/auth` public.
- Header nav shows sign-in CTA when logged out.

### 4. MCP server with OAuth
- Install `@lovable.dev/mcp-js`, add `mcpPlugin()` to `vite.config.ts`, mount at `/mcp`.
- Activate managed Cloud OAuth 2.1 server (`supabase--configure_oauth_server`).
- Add `/.lovable/oauth/consent` route reusing the new BDEA login (bilingual consent screen).
- Configure `defineMcp` with `auth.oauth.issuer` bound to the Supabase issuer.
- Expose tools (all scoped to signed-in user via `ctx.getToken()` → RLS):
  - `list_incidents` — list the user's saved incidents.
  - `get_incident` — fetch one by evidence ID.
  - `create_incident` — create a new incident record.
  - `delete_incident` — delete by evidence ID.
  - `decision_support` — run the ISO 27037 / ACPO triage logic (pure, no data).
  - `lookup_handbook` — return handbook section text (pure, no data).
- Run `app_mcp_server--extract_mcp_manifest` after wiring so the Agent integrations panel lists the tools.

### 5. Verification
- Sign up → create incident → confirm it appears for that user only.
- Sign out / sign in as a second user → confirm isolation.
- Connect from an MCP client (e.g. Claude) → OAuth consent → `list_incidents` returns only that user's rows.

## Out of scope
- No role-based access (admin/officer roles). Every user manages their own records.
- No shared/case-team incidents.
- No migration of decision-support or handbook content into the database — they remain in `translations.ts`.
- The existing PDF export, GPS capture, photo upload, and bilingual UI stay as-is.

## Technical notes

- **Stack:** TanStack Start + Supabase (Lovable Cloud). Server functions (`createServerFn` + `requireSupabaseAuth`) own DB access; RLS keeps each user's data private.
- **Photos:** for the first cut, keep base64 in a `text` column (matches current shape). Can move to Cloud Storage later if the dissertation needs it.
- **MCP transport:** Streamable HTTP at `/mcp`, OAuth issuer = `https://<project-ref>.supabase.co/auth/v1`, tokens verified inside `defineMcp`.
- **Consent route file must be** `src/routes/[.]lovable.oauth.consent.tsx` (TanStack escapes the leading dot).
- **Publish is required** for external MCP clients to reach `/mcp`; local editor preview cannot be added as a connector.

Approve and I'll build it in this order: Cloud + Auth → data migration → route gating → MCP server + OAuth → verify.