import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function userClient(ctx: { getToken: () => string }) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    global: {
      headers: { Authorization: `Bearer ${ctx.getToken()}`, apikey: key },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const COLUMNS =
  "evidence_id, created_at, case_number, date_time, location, border_point, officer_name, badge_id, agency, witness_name, witness_id, device_type, make, model, serial, imei, condition, power, screen_locked, encryption, network, circumstances";

export const listIncidents = defineTool({
  name: "list_incidents",
  title: "List incidents",
  description: "List every chain-of-custody incident record saved by the signed-in BDEA user, newest first.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await userClient(ctx).from("incidents").select(COLUMNS).order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { incidents: data ?? [] },
    };
  },
});

export const getIncident = defineTool({
  name: "get_incident",
  title: "Get incident",
  description: "Fetch a single incident record by its BDEA evidence ID (format BDEA-YYYYMMDD-HHMMSS-XXXX).",
  inputSchema: { evidence_id: z.string().min(1).describe("Evidence ID, e.g. BDEA-20260726-093015-4821") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ evidence_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await userClient(ctx).from("incidents").select(COLUMNS).eq("evidence_id", evidence_id).maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No incident with evidence_id ${evidence_id}` }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { incident: data } };
  },
});
