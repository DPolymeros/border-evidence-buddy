import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";
import { useMemo, useState } from "react";
import { generateEvidenceId, saveIncident, type Incident } from "@/lib/storage";
import { exportIncidentPdf } from "@/lib/pdf";

type IncidentSearch = {
  deviceType?: string;
  power?: "yes" | "no" | "unknown" | "";
  encryption?: "yes" | "no" | "unknown" | "";
};

export const Route = createFileRoute("/incident")({
  component: IncidentPage,
  validateSearch: (s: Record<string, unknown>): IncidentSearch => ({
    deviceType: typeof s.deviceType === "string" ? s.deviceType : undefined,
    power: (["yes", "no", "unknown"].includes(s.power as string) ? s.power : undefined) as IncidentSearch["power"],
    encryption: (["yes", "no", "unknown"].includes(s.encryption as string) ? s.encryption : undefined) as IncidentSearch["encryption"],
  }),
});


type State = Omit<Incident, "id" | "createdAt">;

const initial = (): State => ({
  caseNumber: "",
  dateTime: new Date().toISOString().slice(0, 16),
  location: "",
  borderPoint: "",
  officerName: "",
  badgeId: "",
  agency: "hellenic",
  witnessName: "",
  witnessId: "",
  deviceType: "smartphone",
  make: "",
  model: "",
  serial: "",
  imei: "",
  condition: "",
  power: "unknown",
  screenLocked: "unknown",
  encryption: "unknown",
  network: "",
  circumstances: "",
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/80 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary";

function IncidentPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const mapPower = (p?: string): State["power"] =>
    p === "yes" ? "on" : p === "no" ? "off" : "unknown";
  const mapYNU = (v?: string): "yes" | "no" | "unknown" =>
    v === "yes" || v === "no" ? v : "unknown";
  const [data, setData] = useState<State>(() => ({
    ...initial(),
    ...(search.deviceType ? { deviceType: search.deviceType } : {}),
    ...(search.power ? { power: mapPower(search.power) } : {}),
    ...(search.encryption ? { encryption: mapYNU(search.encryption) } : {}),
  }));
  const evidenceId = useMemo(() => generateEvidenceId(), []);


  const update = <K extends keyof State>(k: K, v: State[K]) => setData((d) => ({ ...d, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => update("circumstances" as never, data.circumstances as never);
    r.onload = () => setData((d) => ({ ...d, photo: r.result as string }));
    r.readAsDataURL(f);
  };

  const handleSave = () => {
    const incident: Incident = { ...data, id: evidenceId, createdAt: new Date().toISOString() };
    saveIncident(incident);
    alert(t.incident.saved);
    navigate({ to: "/records" });
  };

  return (
    <div>
      <div className="mb-6 border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">{t.incident.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.incident.evidenceId}: <span className="font-mono font-semibold">{evidenceId}</span>
        </p>
      </div>

      <div className="mb-4 flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 ${i + 1 <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {t.incident.step} {step} {t.incident.of} {totalSteps}
      </p>

      <div className="bg-card border border-border p-6 space-y-4">
        {step === 1 && (
          <>
            <h2 className="font-semibold text-lg">{t.incident.meta}</h2>
            <Field label={t.incident.caseNumber}>
              <input className={inputCls} value={data.caseNumber} onChange={(e) => update("caseNumber", e.target.value)} />
            </Field>
            <Field label={t.incident.dateTime}>
              <input type="datetime-local" className={inputCls} value={data.dateTime} onChange={(e) => update("dateTime", e.target.value)} />
            </Field>
            <Field label={t.incident.location}>
              <div className="flex gap-2">
                <input className={inputCls} value={data.location} onChange={(e) => update("location", e.target.value)} />
                <button
                  type="button"
                  className="px-3 py-2 text-xs bg-secondary border border-border whitespace-nowrap"
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition((p) =>
                      update("location", `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`)
                    );
                  }}
                >
                  {t.incident.useGps}
                </button>
              </div>
            </Field>
            <Field label={t.incident.borderPoint}>
              <input className={inputCls} value={data.borderPoint} onChange={(e) => update("borderPoint", e.target.value)} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-lg">{t.incident.officer}</h2>
            <Field label={t.incident.officerName}>
              <input className={inputCls} value={data.officerName} onChange={(e) => update("officerName", e.target.value)} />
            </Field>
            <Field label={t.incident.badgeId}>
              <input className={inputCls} value={data.badgeId} onChange={(e) => update("badgeId", e.target.value)} />
            </Field>
            <Field label={t.incident.agency}>
              <select className={inputCls} value={data.agency} onChange={(e) => update("agency", e.target.value)}>
                <option value="hellenic">{t.agencies.hellenic}</option>
                <option value="frontex">{t.agencies.frontex}</option>
                <option value="other">{t.agencies.other}</option>
              </select>
            </Field>
            <Field label={t.incident.witnessName}>
              <input className={inputCls} value={data.witnessName} onChange={(e) => update("witnessName", e.target.value)} />
            </Field>
            <Field label={t.incident.witnessId}>
              <input className={inputCls} value={data.witnessId} onChange={(e) => update("witnessId", e.target.value)} />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-lg">{t.incident.device}</h2>
            <Field label={t.incident.deviceType}>
              <select className={inputCls} value={data.deviceType} onChange={(e) => update("deviceType", e.target.value)}>
                {Object.entries(t.deviceTypes).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.incident.make}>
                <input className={inputCls} value={data.make} onChange={(e) => update("make", e.target.value)} />
              </Field>
              <Field label={t.incident.model}>
                <input className={inputCls} value={data.model} onChange={(e) => update("model", e.target.value)} />
              </Field>
              <Field label={t.incident.serial}>
                <input className={inputCls} value={data.serial} onChange={(e) => update("serial", e.target.value)} />
              </Field>
              <Field label={t.incident.imei}>
                <input className={inputCls} value={data.imei} onChange={(e) => update("imei", e.target.value)} />
              </Field>
            </div>
            <Field label={t.incident.condition}>
              <textarea className={inputCls} rows={2} value={data.condition} onChange={(e) => update("condition", e.target.value)} />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-semibold text-lg">{t.incident.stateTitle}</h2>
            <Field label={t.incident.power}>
              <select className={inputCls} value={data.power} onChange={(e) => update("power", e.target.value as State["power"])}>
                <option value="on">{t.incident.poweredOn}</option>
                <option value="off">{t.incident.poweredOff}</option>
                <option value="unknown">{t.common.unknown}</option>
              </select>
            </Field>
            <Field label={t.incident.screenLocked}>
              <select className={inputCls} value={data.screenLocked} onChange={(e) => update("screenLocked", e.target.value as State["screenLocked"])}>
                <option value="yes">{t.common.yes}</option>
                <option value="no">{t.common.no}</option>
                <option value="unknown">{t.common.unknown}</option>
              </select>
            </Field>
            <Field label={t.incident.encryption}>
              <select className={inputCls} value={data.encryption} onChange={(e) => update("encryption", e.target.value as State["encryption"])}>
                <option value="yes">{t.common.yes}</option>
                <option value="no">{t.common.no}</option>
                <option value="unknown">{t.common.unknown}</option>
              </select>
            </Field>
            <Field label={t.incident.network}>
              <input className={inputCls} value={data.network} onChange={(e) => update("network", e.target.value)} />
            </Field>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="font-semibold text-lg">{t.incident.circumstances}</h2>
            <Field label={t.incident.circumstancesDesc}>
              <textarea className={inputCls} rows={5} value={data.circumstances} onChange={(e) => update("circumstances", e.target.value)} />
            </Field>
            <Field label={t.incident.photo}>
              <input type="file" accept="image/*" onChange={onPhoto} className="text-sm" />
              {data.photo && <img src={data.photo} alt="" className="mt-2 max-h-40 border border-border" />}
            </Field>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          className="px-4 py-2 text-sm border border-border bg-background disabled:opacity-50"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          {t.common.back}
        </button>
        {step < totalSteps ? (
          <button
            className="px-4 py-2 text-sm bg-primary text-primary-foreground"
            onClick={() => setStep((s) => s + 1)}
          >
            {t.common.next}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm border border-border"
              onClick={() =>
                exportIncidentPdf({ ...data, id: evidenceId, createdAt: new Date().toISOString() })
              }
            >

              {t.common.exportPdf}
            </button>
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground"
              onClick={handleSave}
            >
              {t.common.save}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
