import type { Incident } from "./incidents.shape";

const FIELD_LABELS: Record<string, string> = {
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
};

const FIELD_ORDER: (keyof Incident)[] = [
  "id", "createdAt", "caseNumber", "dateTime", "location", "borderPoint",
  "officerName", "badgeId", "agency", "witnessName", "witnessId",
  "deviceType", "make", "model", "serial", "imei", "condition",
  "power", "screenLocked", "encryption", "network", "circumstances",
];

export async function exportIncidentPdf(incident: Incident): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("jspdf");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JsPDFCtor: typeof import("jspdf").jsPDF = (mod as any).jsPDF ?? (mod as any).default;
    const doc = new JsPDFCtor({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;

    doc.setFillColor(30, 50, 95);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BDEA", margin, 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Border Digital Evidence Assistant", margin, 48);
    doc.text("Chain of Custody Document", margin, 60);

    doc.setTextColor(0, 0, 0);
    let y = 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Evidence ID: ${incident.id}`, margin, y);
    y += 22;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 16;

    doc.setFontSize(10);
    const labelW = 170;
    const valueW = pageW - margin * 2 - labelW;
    for (const key of FIELD_ORDER) {
      const raw = incident[key];
      if (raw === undefined || raw === null || raw === "") continue;
      const label = FIELD_LABELS[key] ?? key;
      const lines = doc.splitTextToSize(String(raw), valueW);
      const blockH = Math.max(14, lines.length * 12 + 4);
      if (y + blockH > pageH - margin - 30) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + labelW, y);
      y += blockH;
    }

    if (incident.photo && incident.photo.startsWith("data:image/")) {
      const imgH = 220;
      if (y + imgH + 20 > pageH - margin - 30) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.text("Photo:", margin, y);
      y += 14;
      try {
        const fmt = incident.photo.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(incident.photo, fmt, margin, y, 220, imgH);
        y += imgH + 10;
      } catch { /* ignore */ }
    }

    if (y + 80 > pageH - margin - 30) { doc.addPage(); y = margin; }
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Officer signature:", margin, y);
    doc.text("Witness signature:", pageW / 2 + 10, y);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y + 30, margin + 200, y + 30);
    doc.line(pageW / 2 + 10, y + 30, pageW / 2 + 210, y + 30);

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text("BDEA — Academic prototype, not for operational deployment", margin, pageH - 24);
      doc.text(`Page ${i} / ${pageCount}`, pageW - margin - 60, pageH - 24);
    }

    doc.save(`${incident.id || "incident"}.pdf`);
  } catch (err) {
    console.error("[BDEA] PDF export failed:", err);
    alert("PDF export failed: " + (err instanceof Error ? err.message : String(err)));
  }
}
