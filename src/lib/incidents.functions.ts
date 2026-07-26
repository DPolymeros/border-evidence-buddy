import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { INCIDENT_COLUMNS, rowToIncident, incidentToRow, type Incident } from "./incidents.shape";

const IncidentInput = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  caseNumber: z.string().default(""),
  dateTime: z.string().default(""),
  location: z.string().default(""),
  borderPoint: z.string().default(""),
  officerName: z.string().default(""),
  badgeId: z.string().default(""),
  agency: z.string().default(""),
  witnessName: z.string().default(""),
  witnessId: z.string().default(""),
  deviceType: z.string().default(""),
  make: z.string().default(""),
  model: z.string().default(""),
  serial: z.string().default(""),
  imei: z.string().default(""),
  condition: z.string().default(""),
  power: z.enum(["on", "off", "unknown"]).default("unknown"),
  screenLocked: z.enum(["yes", "no", "unknown"]).default("unknown"),
  encryption: z.enum(["yes", "no", "unknown"]).default("unknown"),
  network: z.string().default(""),
  circumstances: z.string().default(""),
  photo: z.string().optional(),
});

export const listIncidentsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Incident[]> => {
    const { data, error } = await context.supabase
      .from("incidents")
      .select(INCIDENT_COLUMNS)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToIncident);
  });

export const saveIncidentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IncidentInput.parse(d))
  .handler(async ({ data, context }) => {
    const row = incidentToRow(data as Incident, context.userId);
    const { error } = await context.supabase
      .from("incidents")
      .upsert(row, { onConflict: "user_id,evidence_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteIncidentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("incidents")
      .delete()
      .eq("user_id", context.userId)
      .eq("evidence_id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearIncidentsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("incidents")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
