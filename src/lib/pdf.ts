import { jsPDF } from "jspdf";
import type { Incident } from "./storage";

const FIELD_LABELS: Record<keyof Incident, string> = {
  id: "Evidence ID",
  createdAt: "Created At",
  caseNumber: "Case Number",
  dateTime: "Date / Time",
  location: "Location",
  borderPoint: "Border Crossing Point",
  officerName: "Officer Name",
  badgeId: "Badge ID",
  agency: "Agency",
  witnessName: "Witness Name",
  witnessId: "Witness ID",
  deviceType: "Device Type",
  make: "Make",
  model: "Model",
  serial: "Serial Number",
  imei: "IMEI",
  condition: "Physical Condition",
  power: "Power State",
  screenLocked: "Screen Locked",
  encryption: "Encryption Indicators",
  network: "Network Connectivity",
  circumstances: "Seizure Circumstances",
  photo: "Photo",
};

const FIELD_ORDER: (keyof Incident)[] = [
  "id", "createdAt", "caseNumber", "dateTime", "location", "borderPoint",
  "officerName", "badgeId", "agency", "witnessName", "witnessId",
  "deviceType", "make", "model", "serial", "imei", "condition",
  "power", "screenLocked", "encryption", "network", "circumstances",
];

export function exportIncidentPdf(incident: Incident) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  // Header
  doc.setFillColor(30, 50, 95);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("BDEA", margin, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Border Digital Evidence Assistant", margin, 48);
  doc.text("Chain of Custody Document", margin, 60);

  doc.setTextColor(0, 0, 0);
  y = 100;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Evidence ID: ${incident.id}`, margin, y);
  y += 24;

  doc.setFontSize(10);
  const labelW = 160;
  const valueW = pageW - margin * 2 - labelW;

  for (const key of FIELD_ORDER) {
    const val = incident[key];
    if (val === undefined || val === null || val === "") continue;
    const label = FIELD_LABELS[key] ?? key;
    const valueStr = String(val);
    const lines = doc.splitTextToSize(valueStr, valueW);
    const blockH = Math.max(14, lines.length * 12 + 4);

    if (y + blockH > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(lines, margin + labelW, y);
    y += blockH;
  }

  // Photo
  if (incident.photo) {
    if (y + 220 > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Photo:", margin, y);
    y += 12;
    try {
      const fmt = incident.photo.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(incident.photo, fmt, margin, y, 200, 200);
      y += 210;
    } catch {
      doc.setFont("helvetica", "italic");
      doc.text("[photo could not be embedded]", margin, y);
      y += 14;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "BDEA — Academic prototype, not for operational deployment",
      margin,
      pageH - 24,
    );
    doc.text(`Page ${i} / ${pageCount}`, pageW - margin - 60, pageH - 24);
  }

  doc.save(`${incident.id}.pdf`);
}
