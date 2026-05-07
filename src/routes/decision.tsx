import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";
import { useState } from "react";

export const Route = createFileRoute("/decision")({
  component: DecisionPage,
});

type Answers = {
  deviceType: string;
  poweredOn: "yes" | "no" | "unknown" | "";
  encryption: "yes" | "no" | "unknown" | "";
  witness: "yes" | "no" | "";
  pressure: "immediate" | "standard" | "";
};

function buildResult(a: Answers, t: ReturnType<typeof useLang>["t"]) {
  const actions: string[] = [];
  actions.push("Photograph the device in situ before any physical contact.");
  if (a.poweredOn === "yes") {
    actions.push("Do NOT power off. Preserve volatile memory and screen state.");
    actions.push("Isolate from networks: enable airplane mode or use a Faraday bag.");
    if (a.encryption === "yes") {
      actions.push("If unlocked, do not allow the device to lock; consider live acquisition.");
    }
  } else if (a.poweredOn === "no") {
    actions.push("Keep the device powered off. Do not boot it.");
    actions.push("If a smartphone, remove SIM only if procedurally authorised; document.");
  } else {
    actions.push("Treat power state as unknown: assume volatile data is at risk.");
  }
  if (a.witness === "no") {
    actions.push("Locate and record an independent witness before sealing the device.");
  }
  actions.push("Place device in tamper-evident packaging and label with evidence ID.");
  if (a.pressure === "immediate") {
    actions.push("Prioritise scene safety; document deviations from standard procedure.");
  }

  const iso =
    a.poweredOn === "yes"
      ? "ISO/IEC 27037 §5.4 — Acquisition of live systems: minimise change, document every action."
      : "ISO/IEC 27037 §5.3 — Collection of powered-off systems: maintain integrity through preservation.";

  const acpo =
    a.poweredOn === "yes"
      ? "ACPO Principle 2 — A person must be competent to access original data and able to give evidence explaining the relevance and implications of their actions."
      : "ACPO Principle 1 — No action should change data which may subsequently be relied upon in court.";

  return {
    actions,
    iso,
    acpo,
    legal: t.decision.legalPlaceholder,
  };
}

function DecisionPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [a, setA] = useState<Answers>({ deviceType: "smartphone", poweredOn: "", encryption: "", witness: "", pressure: "" });
  const complete = a.poweredOn && a.encryption && a.witness && a.pressure;
  const result = complete ? buildResult(a, t) : null;

  const Q = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="border border-border p-4 bg-card">
      <div className="font-medium mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
  const Opt = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm border ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"}`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="mb-6 border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">{t.decision.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.decision.subtitle}</p>
      </div>

      <div className="grid gap-3">
        <Q label={`1. ${t.decision.q1}`}>
          {Object.entries(t.deviceTypes).map(([k, v]) => (
            <Opt key={k} active={a.deviceType === k} onClick={() => setA({ ...a, deviceType: k })}>{v}</Opt>
          ))}
        </Q>
        <Q label={`2. ${t.decision.q2}`}>
          <Opt active={a.poweredOn === "yes"} onClick={() => setA({ ...a, poweredOn: "yes" })}>{t.common.yes}</Opt>
          <Opt active={a.poweredOn === "no"} onClick={() => setA({ ...a, poweredOn: "no" })}>{t.common.no}</Opt>
          <Opt active={a.poweredOn === "unknown"} onClick={() => setA({ ...a, poweredOn: "unknown" })}>{t.common.unknown}</Opt>
        </Q>
        <Q label={`3. ${t.decision.q3}`}>
          <Opt active={a.encryption === "yes"} onClick={() => setA({ ...a, encryption: "yes" })}>{t.common.yes}</Opt>
          <Opt active={a.encryption === "no"} onClick={() => setA({ ...a, encryption: "no" })}>{t.common.no}</Opt>
          <Opt active={a.encryption === "unknown"} onClick={() => setA({ ...a, encryption: "unknown" })}>{t.common.unknown}</Opt>
        </Q>
        <Q label={`4. ${t.decision.q4}`}>
          <Opt active={a.witness === "yes"} onClick={() => setA({ ...a, witness: "yes" })}>{t.common.yes}</Opt>
          <Opt active={a.witness === "no"} onClick={() => setA({ ...a, witness: "no" })}>{t.common.no}</Opt>
        </Q>
        <Q label={`5. ${t.decision.q5}`}>
          <Opt active={a.pressure === "immediate"} onClick={() => setA({ ...a, pressure: "immediate" })}>{t.decision.timeImmediate}</Opt>
          <Opt active={a.pressure === "standard"} onClick={() => setA({ ...a, pressure: "standard" })}>{t.decision.timeStandard}</Opt>
        </Q>
      </div>

      {result && (
        <div className="mt-6 border-2 border-primary bg-card">
          <div className="bg-primary text-primary-foreground px-4 py-2 font-semibold">{t.decision.result}</div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground/70 mb-2">{t.decision.actions}</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                {result.actions.map((x, i) => <li key={i}>{x}</li>)}
              </ol>
            </div>
            <div className="border-t border-border pt-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground/70">{t.decision.iso}</h3>
              <p className="text-sm mt-1">{result.iso}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground/70">{t.decision.acpo}</h3>
              <p className="text-sm mt-1">{result.acpo}</p>
            </div>
            <div className="bg-secondary p-3 border-l-4 border-accent">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground/70">{t.decision.legal}</h3>
              <p className="text-sm mt-1">{result.legal}</p>
            </div>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground text-sm"
              onClick={() => navigate({ to: "/incident" })}
            >
              {t.common.startFromResult}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
