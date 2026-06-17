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
  const A = t.decision.actions_;
  const actions: string[] = [];
  actions.push(A.photographFirst);
  if (a.poweredOn === "yes") {
    actions.push(A.doNotPowerOff);
    actions.push(A.isolateNetwork);
    if (a.encryption === "yes") {
      actions.push(A.noLock);
    }
  } else if (a.poweredOn === "no") {
    actions.push(A.keepOff);
    actions.push(A.removeSim);
  } else {
    actions.push(A.unknownPower);
  }
  if (a.witness === "no") {
    actions.push(A.findWitness);
  }
  actions.push(A.tamperPackaging);
  if (a.pressure === "immediate") {
    actions.push(A.prioritiseSafety);
  }

  const iso = a.poweredOn === "yes" ? t.decision.isoLive : t.decision.isoOff;
  const acpo = a.poweredOn === "yes" ? t.decision.acpoLive : t.decision.acpoOff;

  return { actions, iso, acpo, legal: t.decision.legalPlaceholder };
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
