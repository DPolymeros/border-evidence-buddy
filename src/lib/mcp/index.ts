import { auth, defineMcp } from "@lovable.dev/mcp-js";
import { listIncidents, getIncident } from "./tools/incidents-read";
import { createIncident, deleteIncident } from "./tools/incidents-write";
import { decisionSupport } from "./tools/decision-support";
import { lookupHandbook } from "./tools/handbook";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bdea-mcp",
  title: "BDEA — Border Digital Evidence Assistant",
  version: "0.1.0",
  instructions:
    "Chain-of-custody and forensic decision-support tools for a Border Digital Evidence Assistant user. Use list_incidents / get_incident / create_incident / delete_incident to manage the signed-in user's incident records, decision_support to run ISO/IEC 27037 + ACPO triage, and lookup_handbook for reference material. Academic prototype — not for operational use.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listIncidents, getIncident, createIncident, deleteIncident, decisionSupport, lookupHandbook],
});
