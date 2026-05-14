/**
 * PDF Export — client-side only, jsPDF v4 compatible.
 *
 * Generates a styled A4 portrait report containing:
 *  01  Cover header (branding, project name, IRC compliance badge)
 *  02  IRC:37-2012 Design Inputs (Road Category, Traffic, CBR, Design Life)
 *  03  Design Traffic (MSA) & Total Thickness results
 *  04  Pavement Layer Stack table (BC, DBM, WMM, GSB) with thickness bars & %
 *  05  IRC Compliance checks
 *  06  Wellbeing & Environment scores
 *  07  Recommended actions
 *  Footer with page numbers
 *
 * Only uses jsPDF v4 APIs: rect, roundedRect, text, setFont, setFontSize,
 * setFillColor, setDrawColor, setTextColor, save, addPage, setPage.
 * No setGlobalAlpha (not in v4).
 */

import jsPDF from 'jspdf';
import type { StreetProject, ComplianceCheck, BoQItem } from '../types/street';
import type { WellbeingMetric } from './wellbeingScore';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExportPayload {
  project: StreetProject;
  designMSA: number;
  totalPavementThickness: number;
  drainageDischarge: number;
  complianceChecks: ComplianceCheck[];
  boqItems: BoQItem[];
  wellbeingMetrics: WellbeingMetric[];
  compositeWellbeingScore: number;
}

// ── Layout constants (mm, A4 portrait 210×297) ──────────────────────────────

const PW = 210;   // page width
const PH = 297;   // page height
const ML = 14;    // left margin
const MR = 14;    // right margin
const CW = PW - ML - MR;  // content width

// ── Color palettes ───────────────────────────────────────────────────────────

const C = {
  bg:       [3,   7,   18 ] as [number,number,number],
  bg2:      [10,  15,  30 ] as [number,number,number],
  bg3:      [16,  22,  42 ] as [number,number,number],
  row1:     [10,  15,  30 ] as [number,number,number],
  row2:     [16,  22,  42 ] as [number,number,number],
  header:   [15,  23,  55 ] as [number,number,number],
  cyan:     [0,   212, 255] as [number,number,number],
  green:    [34,  197, 94 ] as [number,number,number],
  amber:    [245, 158, 11 ] as [number,number,number],
  orange:   [249, 115, 22 ] as [number,number,number],
  red:      [239, 68,  68 ] as [number,number,number],
  blue:     [59,  130, 246] as [number,number,number],
  white:    [240, 248, 255] as [number,number,number],
  muted:    [110, 130, 165] as [number,number,number],
  label:    [100, 120, 160] as [number,number,number],
  value:    [210, 225, 255] as [number,number,number],
  footer:   [10,  15,  28 ] as [number,number,number],
  footerTx: [70,  90,  120] as [number,number,number],
};

const LAYER_COLOR: Record<string, [number,number,number]> = {
  bc:  C.cyan,
  dbm: C.blue,
  wmm: C.orange,
  gsb: C.amber,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fill(doc: jsPDF, rgb: [number,number,number]) { doc.setFillColor(...rgb); }
function textC(doc: jsPDF, rgb: [number,number,number]) { doc.setTextColor(...rgb); }
function draw(doc: jsPDF, rgb: [number,number,number]) { doc.setDrawColor(...rgb); }

function scoreRgb(s: number): [number,number,number] {
  return s >= 75 ? C.green : s >= 50 ? C.amber : s >= 30 ? C.orange : C.red;
}

/** Draws a solid filled rect */
function fr(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: [number,number,number]) {
  fill(doc, rgb); doc.rect(x, y, w, h, 'F');
}

/** Draws a rounded filled rect */
function rr(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, rgb: [number,number,number]) {
  fill(doc, rgb); doc.roundedRect(x, y, w, h, r, r, 'F');
}

/** Section header bar — returns updated y */
function sectionHeader(doc: jsPDF, y: number, label: string): number {
  fr(doc, ML, y, CW, 7, C.header);
  textC(doc, C.cyan);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text(label, ML + 3, y + 4.8);
  return y + 10;
}

/** Striped table row background */
function rowBg(doc: jsPDF, y: number, h: number, idx: number) {
  fr(doc, ML, y, CW, h, idx % 2 === 0 ? C.row1 : C.row2);
}

/** Add page + return new y at top */
function newPage(doc: jsPDF): number {
  doc.addPage(); return ML + 2;
}

/** Check if we need a page break */
function pb(doc: jsPDF, y: number, need: number): number {
  return y + need > PH - 16 ? newPage(doc) : y;
}

/** Today's date string */
function today(): string {
  return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function exportPDFReport(payload: ExportPayload): Promise<void> {
  const {
    project, designMSA, totalPavementThickness,
    complianceChecks, wellbeingMetrics, compositeWellbeingScore,
  } = payload;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── 01 COVER ───────────────────────────────────────────────────────────────
  fr(doc, 0, 0, PW, 50, C.bg);                         // dark header band
  fr(doc, 0, 49.5, PW, 0.6, C.cyan);                   // cyan accent line

  // Logo square
  rr(doc, ML, 10, 13, 13, 2.5, C.cyan);
  textC(doc, C.bg);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('SF', ML + 3.2, 18.7);

  // App name
  textC(doc, C.white);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('StreetForge', ML + 17, 17.5);
  textC(doc, C.cyan);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('IRC CIVIL ENGINEERING PLATFORM', ML + 17, 22.5);

  // Project name
  textC(doc, C.white);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text(project.name, ML, 36);

  // Location + date
  textC(doc, C.muted);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`${project.location}   ·   Generated: ${today()}`, ML, 43);

  // IRC compliance badge (top-right)
  const passed = complianceChecks.filter(c => c.status === 'pass').length;
  const ircPct = Math.round((passed / (complianceChecks.length || 1)) * 100);
  const badgeRgb = ircPct >= 90 ? C.green : ircPct >= 75 ? C.amber : C.red;
  rr(doc, PW - MR - 28, 9, 28, 16, 2.5, badgeRgb);
  textC(doc, C.bg);
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text(`${ircPct}%`, PW - MR - 23, 19);
  doc.setFontSize(6.5);
  doc.text('IRC', PW - MR - 9.5, 23);

  let y = 56;

  // ── 02 IRC:37-2012 DESIGN INPUTS ─────────────────────────────────────────
  y = sectionHeader(doc, y, '01   IRC:37-2012 DESIGN INPUTS');

  const inputs: [string, string][] = [
    ['Road Category',    project.roadCategory],
    ['Initial Traffic',  `${project.trafficVolume} CVPD (Commercial Vehicles Per Day)`],
    ['Design Life',      `${project.designLife} years`],
    ['Subgrade CBR',     `${project.cbr}%`],
    ['Climate Zone',     project.climateZone.charAt(0).toUpperCase() + project.climateZone.slice(1)],
  ];

  inputs.forEach(([label, value], i) => {
    const ry = y + i * 9;
    rowBg(doc, ry, 9, i);
    textC(doc, C.label);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(label, ML + 3, ry + 5.8);
    textC(doc, C.value);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text(value, ML + 50, ry + 5.8);
  });

  y += inputs.length * 9 + 8;

  // ── 03 DESIGN RESULTS ────────────────────────────────────────────────────
  y = pb(doc, y, 40);
  y = sectionHeader(doc, y, '02   DESIGN RESULTS');

  // Two big metric tiles side by side
  const tileW = (CW - 4) / 2;

  // Design Traffic tile
  rr(doc, ML, y, tileW, 22, 3, C.bg2);
  fr(doc, ML, y, 3, 22, C.cyan);                       // left accent bar
  textC(doc, C.muted);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('DESIGN TRAFFIC', ML + 6, y + 6);
  textC(doc, C.cyan);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text(String(designMSA), ML + 6, y + 15.5);
  textC(doc, C.muted);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text('Million Standard Axles (MSA)', ML + 6, y + 20);

  // Total Thickness tile
  const tx = ML + tileW + 4;
  rr(doc, tx, y, tileW, 22, 3, C.bg2);
  fr(doc, tx, y, 3, 22, C.amber);
  textC(doc, C.muted);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('TOTAL PAVEMENT THICKNESS', tx + 6, y + 6);
  textC(doc, C.amber);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text(String(totalPavementThickness), tx + 6, y + 15.5);
  textC(doc, C.muted);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text('mm  (as per IRC:37-2012 Table-1, interpolated)', tx + 6, y + 20);

  y += 28;

  // Methodology note
  fr(doc, ML, y, CW, 9, C.row1);
  textC(doc, C.muted);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text(
    'Growth rate: 7.5%  ·  VDF: 2.5  ·  LDF: 0.75  ·  Formula: N = 365 × A × D × F × [(1+r)^n − 1]/r / 1,000,000',
    ML + 3, y + 5.5,
  );
  y += 14;

  // ── 04 PAVEMENT LAYER STACK ──────────────────────────────────────────────
  y = pb(doc, y, 90);
  y = sectionHeader(doc, y, '03   PAVEMENT LAYER STACK  (IRC:37-2012)');

  // Column header
  fr(doc, ML, y, CW, 8, C.header);
  const colX = [ML+3, ML+50, ML+115, ML+140, ML+162];
  const colLabels = ['Layer', 'Material', 'Thickness', '% of Total', 'IRC Ref'];
  colLabels.forEach((h, i) => {
    textC(doc, C.cyan);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
    doc.text(h, colX[i], y + 5.3);
  });
  y += 8;

  const displayLayers = project.pavementLayers.filter(l => l.id !== 'subgrade');
  const layerTotal = displayLayers.reduce((s, l) => s + l.thickness, 0);
  const BAR_MAX_W = 55;  // max width of the progress bar (fits in thickness column area)

  displayLayers.forEach((layer, i) => {
    const ROW_H = 16;
    rowBg(doc, y, ROW_H, i);

    const rgb = LAYER_COLOR[layer.id] ?? [180, 180, 180] as [number,number,number];
    const pct = layerTotal > 0 ? layer.thickness / layerTotal : 0;

    // Left color strip
    fr(doc, ML, y, 3, ROW_H, rgb);

    // Color swatch
    rr(doc, ML + 3, y + 4, 6, 6, 1, rgb);

    // Layer name
    textC(doc, rgb);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`${layer.shortName} — ${layer.name}`, ML + 12, y + 6.5);
    // Sub-label
    textC(doc, C.muted);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text(layer.irc_ref, ML + 12, y + 11.5);

    // Material
    textC(doc, C.value);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
    doc.text(layer.material, colX[1], y + 6.5);

    // Thickness value
    textC(doc, rgb);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(`${layer.thickness} mm`, colX[2], y + 6.5);

    // Progress bar (below thickness)
    fr(doc, colX[2], y + 8.5, BAR_MAX_W, 2.5, C.bg3);           // track
    fr(doc, colX[2], y + 8.5, BAR_MAX_W * pct, 2.5, rgb);        // fill

    // Percentage
    textC(doc, C.value);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text(`${Math.round(pct * 100)}%`, colX[3], y + 6.5);

    // IRC ref
    textC(doc, C.muted);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text(layer.irc_ref, colX[4], y + 6.5);

    y += ROW_H;
  });

  // Subgrade row
  const SG_H = 10;
  fr(doc, ML, y, CW, SG_H, C.bg2);
  fr(doc, ML, y, 3, SG_H, [107, 79, 42] as [number,number,number]);
  textC(doc, [150, 130, 100] as [number,number,number]);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.text('SG — Compacted Subgrade', ML + 6, y + 6.2);
  textC(doc, C.muted);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text('Treated Subgrade  ·  IRC:36-2010', colX[1], y + 6.2);
  doc.text('500 mm (min)', colX[2], y + 6.2);
  y += SG_H + 6;

  // Layer stack summary bar (full-width proportional visual)
  y = pb(doc, y, 18);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  textC(doc, C.muted);
  doc.text('PROPORTIONAL LAYER DIAGRAM', ML, y + 4);
  y += 7;
  let bx = ML;
  displayLayers.forEach(layer => {
    const rgb = LAYER_COLOR[layer.id] ?? ([180,180,180] as [number,number,number]);
    const w = (layer.thickness / layerTotal) * CW;
    fr(doc, bx, y, w, 8, rgb);
    if (w > 14) {
      textC(doc, C.bg);
      doc.setFontSize(6); doc.setFont('helvetica', 'bold');
      doc.text(layer.shortName, bx + 2, y + 5.2);
    }
    bx += w;
  });
  y += 12;

  // ── 05 IRC COMPLIANCE CHECKS ─────────────────────────────────────────────
  y = pb(doc, y, 60);
  y = sectionHeader(doc, y, '04   IRC COMPLIANCE CHECKS');

  const chkCols = [68, 32, 28, 22, CW - 68 - 32 - 28 - 22];
  const chkHdrs = ['Check Name', 'Standard', 'Required', 'Actual', 'Status'];

  fr(doc, ML, y, CW, 8, C.header);
  let cx2 = ML;
  chkHdrs.forEach((h, i) => {
    textC(doc, C.cyan);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
    doc.text(h, cx2 + 2, y + 5.3);
    cx2 += chkCols[i];
  });
  y += 8;

  complianceChecks.forEach((check, ci) => {
    y = pb(doc, y, 8);
    rowBg(doc, y, 8, ci);
    const stRgb = check.status === 'pass' ? C.green : check.status === 'warning' ? C.amber : C.red;
    const cells = [check.name, check.standard, check.required, check.actual, check.status.toUpperCase()];
    let ccx = ML;
    cells.forEach((cell, j) => {
      if (j === 4) {
        textC(doc, stRgb); doc.setFont('helvetica', 'bold');
      } else {
        textC(doc, j === 0 ? C.value : C.muted);
        doc.setFont('helvetica', j === 0 ? 'bold' : 'normal');
      }
      doc.setFontSize(6.5);
      doc.text(String(cell), ccx + 2, y + 5);
      ccx += chkCols[j];
    });
    y += 8;
  });
  y += 6;

  // ── 06 WELLBEING & ENVIRONMENT SCORES ────────────────────────────────────
  y = pb(doc, y, 30);
  y = sectionHeader(doc, y, '05   WELLBEING & ENVIRONMENT PERFORMANCE');

  // Composite score tile
  const cRgb = scoreRgb(compositeWellbeingScore);
  rr(doc, ML, y, 32, 18, 3, cRgb);
  textC(doc, C.bg);
  doc.setFontSize(15); doc.setFont('helvetica', 'bold');
  doc.text(String(compositeWellbeingScore), ML + 5, y + 12);
  doc.setFontSize(6); doc.setFont('helvetica', 'normal');
  doc.text('/100', ML + 19, y + 12);
  textC(doc, cRgb);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('COMPOSITE WELLBEING SCORE', ML + 36, y + 7);
  textC(doc, C.muted);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('Weighted average across 7 environmental & social metrics (0–100 scale)', ML + 36, y + 13);
  y += 24;

  // Metric rows — 2 columns
  const mW = (CW - 4) / 2;
  wellbeingMetrics.forEach((m, i) => {
    const col = i % 2;
    if (col === 0) y = pb(doc, y, 18);
    const row = Math.floor(i / 2);
    const mx = ML + col * (mW + 4);
    const my = y + row * 18;
    const mRgb = scoreRgb(m.score);

    fr(doc, mx, my, mW, 15, C.bg2);
    fr(doc, mx, my, 3, 15, mRgb);

    textC(doc, C.value);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text(`${m.icon}  ${m.label}`, mx + 6, my + 6);

    textC(doc, C.muted);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    const rat = m.rationale.length > 75 ? m.rationale.slice(0, 72) + '…' : m.rationale;
    doc.text(rat, mx + 6, my + 11, { maxWidth: mW - 22 });

    // Score badge
    rr(doc, mx + mW - 15, my + 3, 12, 9, 1.5, mRgb);
    textC(doc, C.bg);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(String(m.score), mx + mW - 11.5, my + 9);
  });

  y += Math.ceil(wellbeingMetrics.length / 2) * 18 + 8;

  // ── 07 RECOMMENDED ACTIONS ───────────────────────────────────────────────
  const recs = buildRecommendations(payload);
  if (recs.length > 0) {
    y = pb(doc, y, 20);
    y = sectionHeader(doc, y, '06   RECOMMENDED ACTIONS');
    recs.forEach(([title, body], ri) => {
      y = pb(doc, y, 14);
      fr(doc, ML, y, CW, 12, C.bg2);
      fr(doc, ML, y, 3, 12, C.orange);
      textC(doc, C.amber);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text(`${ri + 1}.  ${title}`, ML + 6, y + 5);
      textC(doc, C.muted);
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
      doc.text(body, ML + 6, y + 9.5, { maxWidth: CW - 12 });
      y += 14;
    });
  }

  // ── FOOTER on every page ─────────────────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fr(doc, 0, PH - 11, PW, 11, C.footer);
    textC(doc, C.footerTx);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
    doc.text(
      `StreetForge IRC Platform  ·  ${project.name}  ·  Page ${p} of ${totalPages}`,
      ML, PH - 4,
    );
    doc.text(today(), PW - MR, PH - 4, { align: 'right' });
  }

  // ── SAVE ─────────────────────────────────────────────────────────────────
  const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`streetforge_${safeName}_report.pdf`);
}

// ── Recommendation builder ────────────────────────────────────────────────────

function buildRecommendations(payload: ExportPayload): [string, string][] {
  const { project, wellbeingMetrics, complianceChecks } = payload;
  const recs: [string, string][] = [];

  const pedM = wellbeingMetrics.find(m => m.id === 'pedestrianSafety');
  if (pedM && pedM.score < 60)
    recs.push(['Widen Footpaths', 'Footpath width is below recommended standard. Target ≥2.0m per side per IRC:103-2012, Cl.5.7.']);

  if (!project.segments.some(s => s.type === 'cycle-track'))
    recs.push(['Add Cycle Track', 'No dedicated cycle track present. A 1.5–2.5m cycle track improves active transport and reduces motorised trips.']);

  if (!project.segments.some(s => s.type === 'green-buffer'))
    recs.push(['Add Green Buffer', 'No green buffer present. A 1–2m planted strip reduces Urban Heat Island, absorbs stormwater, and cuts noise by ~5 dB.']);

  const fails = complianceChecks.filter(c => c.status === 'fail');
  if (fails.length > 0)
    recs.push(['Fix IRC Compliance Failures', `${fails.length} check(s) failing: ${fails.map(f => f.name).join('; ')}. Review cross-section geometry.`]);

  if (!project.segments.some(s => s.type === 'drain'))
    recs.push(['Provide Side Drains', 'No side drain channel. Add RCC box drain (IRC:SP:50) on both sides to manage storm runoff.']);

  if (recs.length === 0)
    recs.push(['Design Meets Standards', 'No critical issues detected. Proceed to detailed design phase with geotechnical investigation.']);

  return recs;
}
