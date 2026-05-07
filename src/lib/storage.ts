export type Incident = {
  id: string;
  createdAt: string;
  caseNumber: string;
  dateTime: string;
  location: string;
  borderPoint: string;
  officerName: string;
  badgeId: string;
  agency: string;
  witnessName: string;
  witnessId: string;
  deviceType: string;
  make: string;
  model: string;
  serial: string;
  imei: string;
  condition: string;
  power: "on" | "off" | "unknown";
  screenLocked: "yes" | "no" | "unknown";
  encryption: "yes" | "no" | "unknown";
  network: string;
  circumstances: string;
  photo?: string; // base64
};

const KEY = "bdea_incidents";

export function loadIncidents(): Incident[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveIncident(i: Incident) {
  const all = loadIncidents();
  all.unshift(i);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteIncident(id: string) {
  const all = loadIncidents().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}

export function generateEvidenceId(): string {
  const d = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `BDEA-${stamp}-${rand}`;
}
