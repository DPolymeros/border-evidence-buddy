import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SECTIONS: Record<string, string> = {
  iso_27037:
    "ISO/IEC 27037 identifies four phases for handling digital evidence: Identification, Collection, Acquisition, Preservation. Live systems (§5.4) require minimising change and documenting every action; powered-off systems (§5.3) require integrity preservation.",
  acpo_principles:
    "ACPO Good Practice Principles:\n1. No action should change data which may subsequently be relied upon in court.\n2. A person must be competent to access original data and able to give evidence explaining the relevance and implications of their actions.\n3. An audit trail of all processes applied to evidence should be created and preserved.\n4. The case officer has overall responsibility for compliance.",
  devices:
    "Device-specific quick guides: smartphones — preserve power state, isolate radios; laptops — live vs dead acquisition depending on encryption; USB/SIM — chain-of-custody bagging; drones — treat as multi-device (controller + aircraft + storage).",
  glossary:
    "Key terms: Chain of custody, Volatile memory, Faraday bag, Write blocker, Hash verification, Evidence integrity.",
};

export const lookupHandbook = defineTool({
  name: "lookup_handbook",
  title: "BDEA handbook lookup",
  description: "Return a section of the BDEA reference handbook: ISO/IEC 27037 overview, ACPO principles, device-specific quick guides, or the glossary.",
  inputSchema: {
    section: z.enum(["iso_27037", "acpo_principles", "devices", "glossary"]),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ section }) => ({
    content: [{ type: "text", text: SECTIONS[section] }],
  }),
});
