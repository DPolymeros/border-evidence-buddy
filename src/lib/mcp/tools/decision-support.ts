import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export const decisionSupport = defineTool({
  name: "decision_support",
  title: "Decision support triage",
  description:
    "Run BDEA's ISO/IEC 27037 + ACPO triage. Given device state answers, returns the recommended actions and cited principles for handling a seized device at an EU external border.",
  inputSchema: {
    device_type: z.enum(["smartphone", "laptop", "tablet", "usb", "sim", "hdd", "drone", "other"]),
    powered_on: z.enum(["yes", "no", "unknown"]),
    encryption: z.enum(["yes", "no", "unknown"]),
    witness_present: z.enum(["yes", "no"]),
    time_pressure: z.enum(["immediate", "standard"]),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (a) => {
    const actions: string[] = ["Photograph the device in situ before any physical contact."];
    if (a.powered_on === "yes") {
      actions.push("Do NOT power off. Preserve volatile memory and screen state.");
      actions.push("Isolate from networks (airplane mode or Faraday bag).");
      if (a.encryption === "yes") actions.push("If unlocked, prevent lock; consider live acquisition.");
    } else if (a.powered_on === "no") {
      actions.push("Keep the device powered off. Do not boot it.");
      actions.push("If a smartphone, remove SIM only if procedurally authorised; document.");
    } else {
      actions.push("Treat power state as unknown; assume volatile data at risk.");
    }
    if (a.witness_present === "no") actions.push("Locate and record an independent witness before sealing.");
    actions.push("Place device in tamper-evident packaging and label with evidence ID.");
    if (a.time_pressure === "immediate") actions.push("Prioritise scene safety; document deviations.");

    const iso =
      a.powered_on === "yes"
        ? "ISO/IEC 27037 §5.4 — Acquisition of live systems: minimise change, document every action."
        : "ISO/IEC 27037 §5.3 — Collection of powered-off systems: maintain integrity through preservation.";
    const acpo =
      a.powered_on === "yes"
        ? "ACPO Principle 2 — A person must be competent to access original data and able to give evidence explaining their actions."
        : "ACPO Principle 1 — No action should change data which may subsequently be relied upon in court.";

    const result = { actions, iso_principle: iso, acpo_principle: acpo, device_type: a.device_type };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
