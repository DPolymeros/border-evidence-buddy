import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function userClient(ctx: { getToken: () => string | undefined }) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    global: {
      headers: { apikey: key },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("Authorization", `Bearer ${ctx.getToken()}`);
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function generateEvidenceId(): string {
  const d = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `BDEA-${stamp}-${rand}`;
}

export const createIncident = defineTool({
  name: "create_incident",
  title: "Create incident",
  description: "Create a new chain-of-custody incident record for the signed-in BDEA user. If evidence_id is omitted, one is generated (BDEA-YYYYMMDD-HHMMSS-XXXX).",
  inputSchema: {
    evidence_id: z.string().optional().describe("Optional evidence ID. Generated if omitted."),
    case_number: z.string().optional(),
    date_time: z.string().optional().describe("ISO local datetime (YYYY-MM-DDTHH:mm)."),
    location: z.string().optional().describe("Location or coordinates."),
    border_point: z.string().optional(),
    officer_name: z.string().optional(),
    badge_id: z.string().optional(),
    agency: z.string().optional().describe("hellenic | frontex | other"),
    witness_name: z.string().optional(),
    witness_id: z.string().optional(),
    device_type: z.string().optional().describe("smartphone | laptop | tablet | usb | sim | hdd | drone | other"),
    make: z.string().optional(),
    model: z.string().optional(),
    serial: z.string().optional(),
    imei: z.string().optional(),
    condition: z.string().optional(),
    power: z.enum(["on", "off", "unknown"]).optional(),
    screen_locked: z.enum(["yes", "no", "unknown"]).optional(),
    encryption: z.enum(["yes", "no", "unknown"]).optional(),
    network: z.string().optional(),
    circumstances: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const evidence_id = input.evidence_id ?? generateEvidenceId();
    const row = {
      user_id: ctx.getUserId(),
      evidence_id,
      case_number: input.case_number ?? "",
      date_time: input.date_time ?? "",
      location: input.location ?? "",
      border_point: input.border_point ?? "",
      officer_name: input.officer_name ?? "",
      badge_id: input.badge_id ?? "",
      agency: input.agency ?? "",
      witness_name: input.witness_name ?? "",
      witness_id: input.witness_id ?? "",
      device_type: input.device_type ?? "",
      make: input.make ?? "",
      model: input.model ?? "",
      serial: input.serial ?? "",
      imei: input.imei ?? "",
      condition: input.condition ?? "",
      power: input.power ?? "unknown",
      screen_locked: input.screen_locked ?? "unknown",
      encryption: input.encryption ?? "unknown",
      network: input.network ?? "",
      circumstances: input.circumstances ?? "",
    };
    const { data, error } = await userClient(ctx).from("incidents").insert(row).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created incident ${evidence_id}` }],
      structuredContent: { incident: data },
    };
  },
});

export const deleteIncident = defineTool({
  name: "delete_incident",
  title: "Delete incident",
  description: "Permanently delete an incident record owned by the signed-in BDEA user, by evidence ID.",
  inputSchema: { evidence_id: z.string().min(1) },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ evidence_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { error } = await userClient(ctx).from("incidents").delete().eq("evidence_id", evidence_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Deleted ${evidence_id}` }] };
  },
});
