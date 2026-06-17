import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";
import { useEffect, useState } from "react";
import { clearAll, deleteIncident, loadIncidents, type Incident } from "@/lib/storage";
import { exportIncidentPdf } from "@/lib/pdf";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
});

function RecordsPage() {
  const { t } = useLang();
  const [items, setItems] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => setItems(loadIncidents()), []);

  const refresh = () => setItems(loadIncidents());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">{t.records.title}</h1>
        {items.length > 0 && (
          <button
            className="px-3 py-2 text-sm bg-destructive text-destructive-foreground"
            onClick={() => {
              if (confirm(t.records.confirmClear)) {
                clearAll();
                refresh();
                setSelected(null);
              }
            }}
          >
            {t.common.clearAll}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t.common.noRecords}</p>
      ) : (
        <div className="border border-border bg-card divide-y divide-border">
          {items.map((i) => (
            <div key={i.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm font-semibold break-all">{i.id}</div>
                <div className="text-xs text-muted-foreground">
                  {i.deviceType} — {i.make} {i.model} — {new Date(i.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button className="px-3 py-1 text-xs border border-border" onClick={() => setSelected(i)}>{t.common.view}</button>
                <button className="px-3 py-1 text-xs border border-border" onClick={() => exportIncidentPdf(i)}>
                  {t.common.exportPdf}
                </button>

                <button
                  className="px-3 py-1 text-xs bg-destructive text-destructive-foreground"
                  onClick={() => {
                    if (confirm(t.records.confirmDelete)) {
                      deleteIncident(i.id);
                      refresh();
                      if (selected?.id === i.id) setSelected(null);
                    }
                  }}
                >
                  {t.common.delete}
                </button>
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
            {Object.entries(selected).map(([k, v]) => {
              if (k === "photo" || !v) return null;
              return (
                <div key={k} className="border-b border-border pb-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{k}: </span>
                  <span>{String(v)}</span>
                </div>
              );
            })}
            {selected.photo && (
              <img src={selected.photo} alt="" className="md:col-span-2 max-h-64 border border-border" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
