import type { StreetSegment, PavementLayer, DrainageData, ComplianceCheck, BoQItem, ClimateZone, RoadCategory } from '../types/street';

// IRC:37-2012 — Total Pavement Thickness (mm) lookup: [N_msa_index][CBR_index]
// N_msa breakpoints: 1, 2, 5, 10, 20, 30
// CBR breakpoints:   2, 3, 4, 5, 7, 10
const PAVEMENT_TABLE: number[][] = [
  [660, 510, 450, 405, 360, 310],
  [745, 570, 500, 445, 395, 340],
  [845, 645, 565, 500, 440, 375],
  [925, 705, 620, 545, 475, 405],
  [1010, 770, 675, 595, 520, 445],
  [1060, 815, 715, 630, 550, 470],
];
const N_MSA_BREAKS = [1, 2, 5, 10, 20, 30];
const CBR_BREAKS = [2, 3, 4, 5, 7, 10];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function findIndex(arr: number[], val: number): [number, number, number] {
  if (val <= arr[0]) return [0, 0, 0];
  if (val >= arr[arr.length - 1]) return [arr.length - 1, arr.length - 1, 0];
  for (let i = 0; i < arr.length - 1; i++) {
    if (val >= arr[i] && val <= arr[i + 1]) {
      const t = (val - arr[i]) / (arr[i + 1] - arr[i]);
      return [i, i + 1, t];
    }
  }
  return [0, 0, 0];
}

export function calculateDesignTraffic(cvpd: number, designLife: number): number {
  const growthRate = 0.075; // 7.5% standard
  const ldf = 0.75; // Lane distribution factor (2-lane divided)
  const vdf = 2.5; // Vehicle damage factor (average mix)
  const N = cvpd * ldf * vdf * ((Math.pow(1 + growthRate, designLife) - 1) / growthRate) * 365 / 1e6;
  return Math.round(N * 100) / 100; // msa
}

export function calculatePavementThickness(cbr: number, msa: number): number {
  const [ni, nj, nt] = findIndex(N_MSA_BREAKS, msa);
  const [ci, cj, ct] = findIndex(CBR_BREAKS, cbr);
  const t00 = PAVEMENT_TABLE[ni][ci], t01 = PAVEMENT_TABLE[ni][cj];
  const t10 = PAVEMENT_TABLE[nj][ci], t11 = PAVEMENT_TABLE[nj][cj];
  const tRow1 = lerp(t00, t01, ct), tRow2 = lerp(t10, t11, ct);
  return Math.round(lerp(tRow1, tRow2, nt));
}

// IRC:37-2012 layer thickness distribution (mm)
export function generatePavementLayers(totalThickness: number, _climateZone: ClimateZone): PavementLayer[] {
  const bc = 40;  // Bituminous Concrete (Wearing Course) — fixed
  const dbm = 60; // Dense Bituminous Macadam (Binder Course) — fixed
  const remaining = totalThickness - bc - dbm;
  const wmm = Math.round(remaining * 0.45);
  const gsb = remaining - wmm;
  return [
    { id: 'bc', name: 'Bituminous Concrete', shortName: 'BC', thickness: bc, material: 'Grade-II BC (VG-30)', color: '#1a1a2e', irc_ref: 'IRC:111-2009' },
    { id: 'dbm', name: 'Dense Bituminous Macadam', shortName: 'DBM', thickness: dbm, material: 'DBM Grade-II (VG-30)', color: '#2d3561', irc_ref: 'IRC:111-2009' },
    { id: 'wmm', name: 'Wet Mix Macadam', shortName: 'WMM', thickness: wmm, material: 'WMM (IRC:109)', color: '#4a3728', irc_ref: 'IRC:109-1997' },
    { id: 'gsb', name: 'Granular Sub-Base', shortName: 'GSB', thickness: gsb, material: 'GSB Grade-I (MORT&H)', color: '#8b6914', irc_ref: 'IRC:SP:72-2015' },
    { id: 'subgrade', name: 'Compacted Subgrade', shortName: 'SG', thickness: 500, material: 'Treated Subgrade', color: '#6b4f2a', irc_ref: 'IRC:36-2010' },
  ];
}

// Q = C × I × A / 360 (litres/second)
export function calculateDrainage(data: DrainageData): number {
  return Math.round((data.runoffCoefficient * data.rainfallIntensity * data.catchmentArea / 360) * 100) / 100;
}

// IRC:103-2012 & IRC:86-1983 compliance checks
export function checkIRCCompliance(
  segments: StreetSegment[], roadCategory: RoadCategory, layers: PavementLayer[]
): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const totalWidth = segments.reduce((s, seg) => s + seg.width, 0);
  const carriageways = segments.filter(s => s.type === 'carriageway');
  const footpaths = segments.filter(s => s.type === 'footpath');
  const medians = segments.filter(s => s.type === 'median');
  const cycleTrack = segments.filter(s => s.type === 'cycle-track');

  // Lane width check
  const minLaneWidth: Record<string, number> = { NH: 3.5, SH: 3.5, MDR: 3.0, ODR: 3.0, VR: 2.5 };
  carriageways.forEach((cw, i) => {
    const lanes = cw.lanes || 2;
    const laneW = cw.width / lanes;
    const minW = minLaneWidth[roadCategory];
    checks.push({
      id: `lane-width-${i}`, name: `Carriageway ${i + 1} Lane Width`,
      standard: 'IRC:103-2012, Cl.4.2', required: `≥ ${minW}m`,
      actual: `${laneW.toFixed(2)}m`, status: laneW >= minW ? 'pass' : 'fail',
      description: `Each lane must be ≥ ${minW}m for ${roadCategory}`,
    });
  });

  // Footpath check (urban roads)
  footpaths.forEach((fp, i) => {
    checks.push({
      id: `footpath-${i}`, name: `Footpath ${i + 1} Width`,
      standard: 'IRC:103-2012, Cl.5.7', required: '≥ 1.5m (urban)',
      actual: `${fp.width.toFixed(1)}m`, status: fp.width >= 1.5 ? 'pass' : (fp.width >= 1.2 ? 'warning' : 'fail'),
      description: 'Minimum footpath width for urban roads is 1.5m',
    });
  });

  // Median width check
  medians.forEach((m, i) => {
    checks.push({
      id: `median-${i}`, name: `Median ${i + 1} Width`,
      standard: 'IRC:17-1965, Cl.3.1', required: '≥ 1.2m (planted)',
      actual: `${m.width.toFixed(1)}m`, status: m.width >= 1.2 ? 'pass' : 'fail',
      description: 'Minimum planted median width is 1.2m for safety',
    });
  });

  // Cycle track check
  cycleTrack.forEach((ct, i) => {
    checks.push({
      id: `cycle-${i}`, name: `Cycle Track ${i + 1} Width`,
      standard: 'IRC:11-1962', required: '≥ 1.5m (single)',
      actual: `${ct.width.toFixed(1)}m`, status: ct.width >= 1.5 ? 'pass' : 'fail',
      description: 'Minimum cycle track width is 1.5m for single direction',
    });
  });

  // Total width check
  const minROW: Record<string, number> = { NH: 30, SH: 20, MDR: 15, ODR: 10, VR: 7.5 };
  checks.push({
    id: 'total-width', name: 'Right of Way Width',
    standard: 'IRC:86-1983', required: `≥ ${minROW[roadCategory]}m`,
    actual: `${totalWidth.toFixed(1)}m`,
    status: totalWidth >= minROW[roadCategory] ? 'pass' : (totalWidth >= minROW[roadCategory] * 0.9 ? 'warning' : 'fail'),
    description: `Minimum ROW for ${roadCategory} is ${minROW[roadCategory]}m`,
  });

  // Pavement thickness check
  const wearLayer = layers.find(l => l.id === 'bc');
  if (wearLayer) {
    checks.push({
      id: 'wearing-course', name: 'Wearing Course Thickness',
      standard: 'IRC:111-2009', required: '≥ 40mm',
      actual: `${wearLayer.thickness}mm`,
      status: wearLayer.thickness >= 40 ? 'pass' : 'fail',
      description: 'Minimum BC wearing course thickness is 40mm',
    });
  }

  return checks;
}

export function generateBoQ(segments: StreetSegment[], layers: PavementLayer[], roadLength: number): BoQItem[] {
  const totalWidth = segments.reduce((s, sg) => s + sg.width, 0);
  const items: BoQItem[] = [];
  let idx = 1;

  // Earthwork
  const excavationVolume = Math.round(totalWidth * roadLength * 0.65);
  items.push({ id: `boq-${idx++}`, description: 'Earthwork in Excavation (Embankment / Formation)', unit: 'Cum', quantity: excavationVolume, rate: 120, amount: excavationVolume * 120, irc_ref: 'MORT&H 301' });

  // Subgrade preparation
  const subgradeArea = Math.round(totalWidth * roadLength);
  items.push({ id: `boq-${idx++}`, description: 'Subgrade preparation & compaction (300mm depth)', unit: 'Sqm', quantity: subgradeArea, rate: 85, amount: subgradeArea * 85, irc_ref: 'IRC:36-2010' });

  // Pavement layers
  const carriageway = segments.filter(s => s.type === 'carriageway').reduce((s, sg) => s + sg.width, 0);
  const layerRates: Record<string, number> = { gsb: 650, wmm: 980, dbm: 3200, bc: 4800 };
  const layerDescs: Record<string, string> = {
    gsb: 'Granular Sub-Base (GSB) - Grade I material',
    wmm: 'Wet Mix Macadam (WMM) - IRC:109',
    dbm: 'Dense Bituminous Macadam (DBM) Grade-II with VG-30',
    bc: 'Bituminous Concrete (BC) Grade-II Wearing Course',
  };
  layers.filter(l => l.id !== 'subgrade').forEach(layer => {
    const vol = Math.round(carriageway * roadLength * (layer.thickness / 1000) * 100) / 100;
    const rate = layerRates[layer.id] || 1000;
    items.push({ id: `boq-${idx++}`, description: layerDescs[layer.id] || layer.name, unit: 'Cum', quantity: vol, rate, amount: Math.round(vol * rate), irc_ref: layer.irc_ref });
  });

  // Kerb & drain
  items.push({ id: `boq-${idx++}`, description: 'Precast RCC Kerb Stone 230×150mm (IS:5758)', unit: 'Rmt', quantity: roadLength * 2, rate: 280, amount: roadLength * 2 * 280 });
  items.push({ id: `boq-${idx++}`, description: 'RCC Box Drain 600×600mm (IRC:SP:50)', unit: 'Rmt', quantity: roadLength * 2, rate: 3800, amount: roadLength * 2 * 3800 });

  // Footpath paving
  const fwWidth = segments.filter(s => s.type === 'footpath').reduce((s, sg) => s + sg.width, 0);
  if (fwWidth > 0) {
    const fpArea = Math.round(fwWidth * roadLength);
    items.push({ id: `boq-${idx++}`, description: 'Interlocking Paver Block 80mm thick (footpath)', unit: 'Sqm', quantity: fpArea, rate: 580, amount: fpArea * 580 });
  }

  // Road markings
  items.push({ id: `boq-${idx++}`, description: 'Thermoplastic Road Marking Paint (IRC:35)', unit: 'Sqm', quantity: Math.round(carriageway * roadLength * 0.05), rate: 420, amount: Math.round(carriageway * roadLength * 0.05 * 420) });

  return items;
}
