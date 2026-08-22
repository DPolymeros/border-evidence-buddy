import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";
import { useEffect, useState } from "react";
import { clearAll, deleteIncident, loadIncidents, saveIncident, type Handover, type Incident } from "@/lib/storage";
import { exportIncidentPdf } from "@/lib/pdf";
import { emptyHandover, HandoverFields } from "@/components/HandoverEditor";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
});

function RecordsPage() {
  const { t, lang } = useLang();
  const [items, setItems] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [adding, setAdding] = useState<Handover | null>(null);
  const [savingHandover, setSavingHandover] = useState(false);
  const [loading, setLoading] = useState(true);
  const locale = lang === "el" ? "el-GR" : "en-GB";

  const openRecord = (i: Incident) => {
    setSelected(i);
    setAdding(null);
  };

  const saveHandover = async () => {
    if (!selected || !adding) return;
    setSavingHandover(true);
    try {
      const updated: Incident = { ...selected, handovers: [...(selected.handovers ?? []), adding] };
      await saveIncident(updated);
      setSelected(updated);
      setAdding(null);
      await refresh();
    } catch (e) {
      alert("Save failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSavingHandover(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await loadIncidents());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">{t.records.title}</h1>
        {items.length > 0 && (
          <button className="px-3 py-2 text-sm bg-destructive text-destructive-foreground"
            onClick={async () => {
              if (confirm(t.records.confirmClear)) {
                await clearAll();
                await refresh();
                setSelected(null);
              }
            }}>{t.common.clearAll}</button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t.common.noRecords}</p>
      ) : (
        <div className="border border-border bg-card divide-y divide-border">
          {items.map((i) => (
            <div key={i.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm font-semibold break-all">{i.id}</div>
                <div className="text-xs text-muted-foreground">
                  {t.deviceTypes[i.deviceType as keyof typeof t.deviceTypes] ?? i.deviceType} — {i.make} {i.model} — {new Date(i.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.handovers.count}: {(i.handovers ?? []).length}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button className="px-3 py-1 text-xs border border-border" onClick={() => openRecord(i)}>{t.common.view}</button>
                <button className="px-3 py-1 text-xs border border-border" onClick={() => exportIncidentPdf(i)}>{t.common.exportPdf}</button>
                <button className="px-3 py-1 text-xs bg-destructive text-destructive-foreground"
                  onClick={async () => {
                    if (confirm(t.records.confirmDelete)) {
                      await deleteIncident(i.id);
                      await refresh();
                      if (selected?.id === i.id) setSelected(null);
                    }
                  }}>{t.common.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-6 border-2 border-primary bg-card">
          <div className="bg-primary text-primary-foreground px-4 py-2 font-semibold flex justify-between">
            <span className="font-mono">{selected.id}</span>
            <button onClick={() => setSelected(null)} className="text-xs">×</button>
          </div>
          <div className="p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { key: "id", label: t.incident.evidenceId },
              { key: "createdAt", label: t.records.createdAtLabel },
              { key: "caseNumber", label: t.incident.caseNumber },
              { key: "dateTime", label: t.records.dateTimeLabel },
              { key: "location", label: t.incident.location },
              { key: "borderPoint", label: t.incident.borderPoint },
              { key: "officerName", label: t.incident.officerName },
              { key: "badgeId", label: t.incident.badgeId },
              { key: "agency", label: t.incident.agency },
              { key: "witnessName", label: t.incident.witnessName },
              { key: "witnessId", label: t.incident.witnessId },
              { key: "deviceType", label: t.incident.deviceType },
              { key: "make", label: t.incident.make },
              { key: "model", label: t.incident.model },
              { key: "serial", label: t.incident.serial },
              { key: "imei", label: t.incident.imei },
              { key: "condition", label: t.incident.condition },
              { key: "power", label: t.incident.power },
              { key: "screenLocked", label: t.incident.screenLocked },
              { key: "encryption", label: t.incident.encryption },
              { key: "network", label: t.incident.network },
              { key: "circumstances", label: t.incident.circumstances },
            ].map(({ key, label }) => {
              const v = selected[key as keyof Incident];
              if (!v) return null;
              let display = String(v);
              if (key === "createdAt" || key === "dateTime") display = new Date(String(v)).toLocaleString(locale);
              else if (key === "deviceType") display = t.deviceTypes[v as keyof typeof t.deviceTypes] ?? String(v);
              else if (key === "agency") display = t.agencies[v as keyof typeof t.agencies] ?? String(v);
              else if (key === "power") display = v === "on" ? t.incident.poweredOn : v === "off" ? t.incident.poweredOff : t.common.unknown;
              else if (key === "screenLocked" || key === "encryption") display = v === "yes" ? t.common.yes : v === "no" ? t.common.no : t.common.unknown;
              return (
                <div key={key} className="border-b border-border pb-1">
                  <span className={`text-xs tracking-wide text-muted-foreground ${lang === "el" ? "" : "uppercase"}`}>{label}: </span>
                  <span>{display}</span>
                </div>
              );
            })}
            {selected.photo && (
              <img src={selected.photo} alt="" className="md:col-span-2 max-h-64 border border-border" />
            )}
          </div>
          <div className="p-4 border-t border-border space-y-3">
            <h3 className="font-semibold text-sm">{t.handovers.title}</h3>
            {(selected.handovers ?? []).map((h) => (
              <div key={h.seq} className="border border-border p-3 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-span-2 font-semibold">{t.handovers.item} #{h.seq}</div>
                {([
                  { v: h.dateTime ? new Date(h.dateTime).toLocaleString(locale) : "", label: t.handovers.dateTime },
                  { v: h.fromName, label: t.handovers.fromName },
                  { v: h.fromBadge, label: t.handovers.fromBadge },
                  { v: t.agencies[h.fromAgency as keyof typeof t.agencies] ?? h.fromAgency, label: t.handovers.fromAgency },
                  { v: h.toName, label: t.handovers.toName },
                  { v: h.toBadge, label: t.handovers.toBadge },
                  { v: h.toUnit, label: t.handovers.toUnit },
                  { v: h.place, label: t.handovers.place },
                  { v: t.handovers.reasons[h.reason as keyof typeof t.handovers.reasons] ?? h.reason, label: t.handovers.reason },
                  { v: t.handovers.sealStates[h.sealState as keyof typeof t.handovers.sealStates] ?? h.sealState, label: t.handovers.sealState },
                  { v: h.sealNumber, label: t.handovers.sealNumber },
                  { v: h.notes, label: t.handovers.notes },
                ] as { v: string; label: string }[]).map(({ v, label }, idx) =>
                  v ? (
                    <div key={idx} className="border-b border-border pb-1">
                      <span className={`text-xs tracking-wide text-muted-foreground ${lang === "el" ? "" : "uppercase"}`}>{label}: </span>
                      <span>{v}</span>
                    </div>
                  ) : null
                )}
              </div>
            ))}
            {adding ? (
              <div className="border border-border p-3 space-y-3">
                <div className="font-semibold text-sm">{t.handovers.item} #{adding.seq}</div>
                <HandoverFields h={adding} onChange={setAdding} />
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50"
                    onClick={saveHandover} disabled={savingHandover}>
                    {savingHandover ? "..." : t.common.save}
                  </button>
                  <button className="px-4 py-2 text-sm border border-border" onClick={() => setAdding(null)}>
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button className="px-4 py-2 text-sm border border-border bg-secondary"
                onClick={() => setAdding(emptyHandover((selected.handovers?.length ?? 0) + 1))}>
                {t.handovers.add}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
