import { useLang } from "@/lib/lang";
import type { Handover } from "@/lib/storage";

export function emptyHandover(seq: number): Handover {
  return {
    seq,
    dateTime: new Date().toISOString().slice(0, 16),
    fromName: "",
    fromBadge: "",
    fromAgency: "hellenic",
    toName: "",
    toBadge: "",
    toUnit: "",
    place: "",
    reason: "transport",
    sealState: "intact",
    sealNumber: "",
    notes: "",
  };
}

const inputCls =
  "w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary";

export function HandoverFields({
  h,
  onChange,
}: {
  h: Handover;
  onChange: (next: Handover) => void;
}) {
  const { t, lang } = useLang();
  const set = <K extends keyof Handover>(k: K, v: Handover[K]) => onChange({ ...h, [k]: v });
  const Label = ({ text }: { text: string }) => (
    <span className={`text-xs font-medium text-foreground/80 tracking-wide ${lang === "el" ? "" : "uppercase"}`}>
      {text}
    </span>
  );
  return (
    <div className="space-y-3">
      <div>
        <Label text={t.handovers.dateTime} />
        <input type="datetime-local" className={`${inputCls} mt-1`} value={h.dateTime} onChange={(e) => set("dateTime", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label text={t.handovers.fromName} />
          <input className={`${inputCls} mt-1`} value={h.fromName} onChange={(e) => set("fromName", e.target.value)} />
        </div>
        <div>
          <Label text={t.handovers.fromBadge} />
          <input className={`${inputCls} mt-1`} value={h.fromBadge} onChange={(e) => set("fromBadge", e.target.value)} />
        </div>
        <div>
          <Label text={t.handovers.fromAgency} />
          <select className={`${inputCls} mt-1`} value={h.fromAgency} onChange={(e) => set("fromAgency", e.target.value)}>
            <option value="hellenic">{t.agencies.hellenic}</option>
            <option value="frontex">{t.agencies.frontex}</option>
            <option value="other">{t.agencies.other}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label text={t.handovers.toName} />
          <input className={`${inputCls} mt-1`} value={h.toName} onChange={(e) => set("toName", e.target.value)} />
        </div>
        <div>
          <Label text={t.handovers.toBadge} />
          <input className={`${inputCls} mt-1`} value={h.toBadge} onChange={(e) => set("toBadge", e.target.value)} />
        </div>
        <div>
          <Label text={t.handovers.toUnit} />
          <input className={`${inputCls} mt-1`} value={h.toUnit} onChange={(e) => set("toUnit", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label text={t.handovers.place} />
          <input className={`${inputCls} mt-1`} value={h.place} onChange={(e) => set("place", e.target.value)} />
        </div>
        <div>
          <Label text={t.handovers.reason} />
          <select className={`${inputCls} mt-1`} value={h.reason} onChange={(e) => set("reason", e.target.value)}>
            {Object.entries(t.handovers.reasons).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label text={t.handovers.sealState} />
          <select className={`${inputCls} mt-1`} value={h.sealState} onChange={(e) => set("sealState", e.target.value)}>
            {Object.entries(t.handovers.sealStates).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <Label text={t.handovers.sealNumber} />
          <input className={`${inputCls} mt-1`} value={h.sealNumber} onChange={(e) => set("sealNumber", e.target.value)} />
        </div>
      </div>
      <div>
        <Label text={t.handovers.notes} />
        <textarea className={`${inputCls} mt-1`} rows={3} value={h.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
    </div>
  );
}
