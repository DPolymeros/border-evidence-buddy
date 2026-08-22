import type { Incident } from "./incidents.shape";

export type { Incident, Handover } from "./incidents.shape";

const KEY = "bdea_incidents";

function read(): Incident[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Incident[]) : [];
  } catch {
    return [];
  }
}

function write(items: Incident[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function loadIncidents(): Promise<Incident[]> {
  return read()
    .map((i) => ({ ...i, handovers: Array.isArray(i.handovers) ? i.handovers : [] }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveIncident(i: Incident): Promise<void> {
  const items = read();
  const idx = items.findIndex((x) => x.id === i.id);
  if (idx >= 0) items[idx] = i;
  else items.push(i);
  write(items);
}

export async function deleteIncident(id: string): Promise<void> {
  write(read().filter((x) => x.id !== id));
}

export async function clearAll(): Promise<void> {
  write([]);
}

export function generateEvidenceId(): string {
  const d = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `BDEA-${stamp}-${rand}`;
}
