export type Handover = {
  seq: number;
  dateTime: string;
  fromName: string;
  fromBadge: string;
  fromAgency: string;
  toName: string;
  toBadge: string;
  toUnit: string;
  place: string;
  reason: string;
  sealState: string;
  sealNumber: string;
  notes: string;
};

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
  photo?: string;
  handovers: Handover[];
};

export const INCIDENT_COLUMNS =
  "evidence_id, created_at, case_number, date_time, location, border_point, officer_name, badge_id, agency, witness_name, witness_id, device_type, make, model, serial, imei, condition, power, screen_locked, encryption, network, circumstances, photo, handovers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToIncident(r: any): Incident {
  return {
    id: r.evidence_id,
    createdAt: r.created_at,
    caseNumber: r.case_number ?? "",
    dateTime: r.date_time ?? "",
    location: r.location ?? "",
    borderPoint: r.border_point ?? "",
    officerName: r.officer_name ?? "",
    badgeId: r.badge_id ?? "",
    agency: r.agency ?? "",
    witnessName: r.witness_name ?? "",
    witnessId: r.witness_id ?? "",
    deviceType: r.device_type ?? "",
    make: r.make ?? "",
    model: r.model ?? "",
    serial: r.serial ?? "",
    imei: r.imei ?? "",
    condition: r.condition ?? "",
    power: (r.power ?? "unknown") as Incident["power"],
    screenLocked: (r.screen_locked ?? "unknown") as Incident["screenLocked"],
    encryption: (r.encryption ?? "unknown") as Incident["encryption"],
    network: r.network ?? "",
    circumstances: r.circumstances ?? "",
    photo: r.photo ?? undefined,
    handovers: Array.isArray(r.handovers) ? (r.handovers as Handover[]) : [],
  };
}

export function incidentToRow(i: Incident, userId: string) {
  return {
    user_id: userId,
    evidence_id: i.id,
    case_number: i.caseNumber,
    date_time: i.dateTime,
    location: i.location,
    border_point: i.borderPoint,
    officer_name: i.officerName,
    badge_id: i.badgeId,
    agency: i.agency,
    witness_name: i.witnessName,
    witness_id: i.witnessId,
    device_type: i.deviceType,
    make: i.make,
    model: i.model,
    serial: i.serial,
    imei: i.imei,
    condition: i.condition,
    power: i.power,
    screen_locked: i.screenLocked,
    encryption: i.encryption,
    network: i.network,
    circumstances: i.circumstances,
    photo: i.photo ?? null,
    handovers: (i.handovers ?? []) as unknown as Record<string, unknown>[],
    created_at: i.createdAt,
  };
}
