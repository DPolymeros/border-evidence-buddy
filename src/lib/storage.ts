import {
  listIncidentsFn,
  saveIncidentFn,
  deleteIncidentFn,
  clearIncidentsFn,
} from "./incidents.functions";
import type { Incident } from "./incidents.shape";

export type { Incident } from "./incidents.shape";

export async function loadIncidents(): Promise<Incident[]> {
  return await listIncidentsFn();
}

export async function saveIncident(i: Incident): Promise<void> {
  await saveIncidentFn({ data: i });
}

export async function deleteIncident(id: string): Promise<void> {
  await deleteIncidentFn({ data: { id } });
}

export async function clearAll(): Promise<void> {
  await clearIncidentsFn();
}

export function generateEvidenceId(): string {
  const d = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `BDEA-${stamp}-${rand}`;
}
