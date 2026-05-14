/**
 * Wellbeing & Environmental Performance Scoring Model
 *
 * All scores are normalized to a 0–100 scale (0 = worst, 100 = best).
 *
 * Formula:
 *   compositeScore = Σ (metricScore_i × weight_i) / Σ weight_i
 *
 * Each metric's raw inputs are mapped to the 0–100 range using
 * piecewise linear interpolation with domain-specific breakpoints.
 *
 * Admin-configurable weights live in DEFAULT_WEIGHTS and can be
 * overridden at runtime (see WellbeingWeights type).
 */

import type { StreetSegment, StreetProject } from '../types/street';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WellbeingMetric {
  id: string;
  label: string;
  icon: string;
  score: number;           // 0–100
  color: string;           // CSS color
  rationale: string;
  category: 'safety' | 'environment' | 'mobility' | 'maintenance';
  weight: number;          // relative weight (default from WellbeingWeights)
}

export interface WellbeingWeights {
  pedestrianSafety: number;
  airNoisePollution: number;
  stormwaterManagement: number;
  urbanHeatIsland: number;
  accessibility: number;
  activeTransport: number;
  maintenanceBurden: number;
}

export const DEFAULT_WEIGHTS: WellbeingWeights = {
  pedestrianSafety: 0.20,
  airNoisePollution: 0.15,
  stormwaterManagement: 0.15,
  urbanHeatIsland: 0.15,
  accessibility: 0.15,
  activeTransport: 0.10,
  maintenanceBurden: 0.10,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp x to [0, 100] */
function clamp(x: number): number {
  return Math.min(100, Math.max(0, x));
}

/**
 * Piecewise-linear map.
 * domain and range must be same length (≥2), domain must be ascending.
 */
function piecewiseMap(
  value: number,
  domain: number[],
  range: number[],
): number {
  if (value <= domain[0]) return range[0];
  if (value >= domain[domain.length - 1]) return range[range.length - 1];
  for (let i = 0; i < domain.length - 1; i++) {
    if (value <= domain[i + 1]) {
      const t = (value - domain[i]) / (domain[i + 1] - domain[i]);
      return range[i] + t * (range[i + 1] - range[i]);
    }
  }
  return range[range.length - 1];
}

/** Return a CSS hsl color for a 0–100 score (red → amber → green) */
function scoreColor(score: number): string {
  if (score >= 75) return '#22c55e';  // green
  if (score >= 50) return '#f59e0b';  // amber
  if (score >= 30) return '#f97316';  // orange
  return '#ef4444';                   // red
}

// ---------------------------------------------------------------------------
// Individual metric scorers
// ---------------------------------------------------------------------------

/**
 * Pedestrian Safety (0–100)
 * Inputs: footpath total width, footpath fraction of ROW,
 *         presence of median (physical separation),
 *         carriageway speed proxy (traffic volume).
 */
function scorePedestrianSafety(
  segments: StreetSegment[],
  trafficVolume: number,
): number {
  const fpWidth = segments
    .filter(s => s.type === 'footpath')
    .reduce((acc, s) => acc + s.width, 0);
  const totalWidth = segments.reduce((acc, s) => acc + s.width, 0);
  const hasMedian = segments.some(s => s.type === 'median');
  const fpRatio = totalWidth > 0 ? fpWidth / totalWidth : 0;

  // Footpath width sub-score: 0→0, 1.5→50, 3→80, 5→100
  const fpScore = piecewiseMap(fpWidth, [0, 1.5, 3, 5], [0, 50, 80, 100]);
  // Footpath ratio sub-score: 0→0, 0.15→50, 0.30→100
  const ratioScore = piecewiseMap(fpRatio, [0, 0.15, 0.3], [0, 50, 100]);
  // Median bonus
  const medianBonus = hasMedian ? 10 : 0;
  // Traffic penalty: low traffic = safer for pedestrians
  const trafficPenalty = piecewiseMap(trafficVolume, [0, 500, 2000, 5000], [0, 0, 10, 25]);

  return clamp((fpScore * 0.5 + ratioScore * 0.3 + medianBonus) * (1 - trafficPenalty / 100));
}

/**
 * Air & Noise Pollution (0–100, higher = less pollution)
 * Inputs: traffic volume, green buffer width, presence of cycle track.
 */
function scoreAirNoisePollution(
  segments: StreetSegment[],
  trafficVolume: number,
): number {
  const greenWidth = segments
    .filter(s => s.type === 'green-buffer' || s.type === 'median')
    .reduce((acc, s) => acc + s.width, 0);
  const hasCycleTrack = segments.some(s => s.type === 'cycle-track');

  // Traffic volume is primary driver of pollution
  const trafficScore = piecewiseMap(trafficVolume, [50, 200, 1000, 5000], [90, 70, 40, 10]);
  // Green mitigation bonus
  const greenBonus = piecewiseMap(greenWidth, [0, 1, 3, 6], [0, 5, 10, 15]);
  // Cycle track encourages modal shift → reduced vehicle trips
  const cycleBonus = hasCycleTrack ? 8 : 0;

  return clamp(trafficScore + greenBonus + cycleBonus);
}

/**
 * Stormwater Management (0–100)
 * Inputs: green buffer area, drain presence, pavement permeability proxy.
 */
function scoreStormwaterManagement(
  segments: StreetSegment[],
  pavementLayers: { id: string }[],
): number {
  const greenWidth = segments
    .filter(s => s.type === 'green-buffer')
    .reduce((acc, s) => acc + s.width, 0);
  const hasDrain = segments.some(s => s.type === 'drain');
  const totalWidth = segments.reduce((acc, s) => acc + s.width, 0);
  const impervious = segments
    .filter(s => ['carriageway', 'parking', 'footpath'].includes(s.type))
    .reduce((acc, s) => acc + s.width, 0);

  const imperviousRatio = totalWidth > 0 ? impervious / totalWidth : 1;

  // Green score
  const greenScore = piecewiseMap(greenWidth, [0, 1, 3, 6], [20, 40, 65, 90]);
  // Drain bonus
  const drainBonus = hasDrain ? 15 : 0;
  // Impervious penalty
  const imperviousPenalty = piecewiseMap(imperviousRatio, [0, 0.5, 0.8, 1], [0, 5, 15, 30]);
  // Void in pavement layers (permeable base = small bonus)
  const hasGSB = pavementLayers.some(l => l.id === 'gsb');
  const gsbBonus = hasGSB ? 5 : 0;

  return clamp(greenScore + drainBonus + gsbBonus - imperviousPenalty);
}

/**
 * Urban Heat Island Effect (0–100, higher = cooler street)
 * Inputs: green cover ratio, pavement area ratio.
 */
function scoreUrbanHeatIsland(segments: StreetSegment[]): number {
  const totalWidth = segments.reduce((acc, s) => acc + s.width, 0);
  const greenWidth = segments
    .filter(s => s.type === 'green-buffer' || s.type === 'median')
    .reduce((acc, s) => acc + s.width, 0);
  const greenRatio = totalWidth > 0 ? greenWidth / totalWidth : 0;
  const pavementWidth = segments
    .filter(s => ['carriageway', 'parking'].includes(s.type))
    .reduce((acc, s) => acc + s.width, 0);
  const pavementRatio = totalWidth > 0 ? pavementWidth / totalWidth : 0;

  const greenScore = piecewiseMap(greenRatio, [0, 0.05, 0.15, 0.30], [15, 35, 65, 90]);
  const pavementPenalty = piecewiseMap(pavementRatio, [0, 0.3, 0.6, 0.9], [0, 5, 15, 30]);

  return clamp(greenScore - pavementPenalty);
}

/**
 * Accessibility (0–100)
 * Inputs: footpath width, min footpath (disability std ≥1.8m), cycle track.
 */
function scoreAccessibility(segments: StreetSegment[]): number {
  const footpaths = segments.filter(s => s.type === 'footpath');
  const fpWidth = footpaths.reduce((acc, s) => acc + s.width, 0);
  const minFp = footpaths.length > 0
    ? Math.min(...footpaths.map(s => s.width))
    : 0;
  const hasCycleTrack = segments.some(s => s.type === 'cycle-track');

  // Min footpath width for wheelchair access (IRC:103 requires ≥1.8m for accessibility)
  const minFpScore = piecewiseMap(minFp, [0, 1.2, 1.8, 3.0], [0, 40, 75, 100]);
  const totalFpScore = piecewiseMap(fpWidth, [0, 1.5, 3, 6], [0, 35, 70, 100]);
  const cycleBonus = hasCycleTrack ? 10 : 0;

  return clamp(minFpScore * 0.6 + totalFpScore * 0.3 + cycleBonus);
}

/**
 * Active Transport Friendliness (0–100)
 * Inputs: cycle track width, footpath width, green buffer.
 */
function scoreActiveTransport(segments: StreetSegment[]): number {
  const cycleWidth = segments
    .filter(s => s.type === 'cycle-track')
    .reduce((acc, s) => acc + s.width, 0);
  const fpWidth = segments
    .filter(s => s.type === 'footpath')
    .reduce((acc, s) => acc + s.width, 0);
  const greenWidth = segments
    .filter(s => s.type === 'green-buffer')
    .reduce((acc, s) => acc + s.width, 0);

  const cycleScore = piecewiseMap(cycleWidth, [0, 1.5, 2.5, 4], [0, 45, 75, 100]);
  const fpScore = piecewiseMap(fpWidth, [0, 1.5, 3, 5], [10, 30, 55, 75]);
  const greenBonus = piecewiseMap(greenWidth, [0, 1, 3], [0, 5, 10]);

  // Heavy bonus for cycle tracks (they're the key active transport infrastructure)
  return clamp(cycleScore * 0.60 + fpScore * 0.30 + greenBonus);
}

/**
 * Maintenance Burden (0–100, higher = easier to maintain)
 * Inputs: pavement material quality (BC > WMM), drain presence, total road width.
 */
function scoreMaintenanceBurden(
  segments: StreetSegment[],
  pavementLayers: { id: string; thickness: number }[],
  totalPavementThickness: number,
): number {
  const hasDrain = segments.some(s => s.type === 'drain');
  const totalWidth = segments.reduce((acc, s) => acc + s.width, 0);
  const bcLayer = pavementLayers.find(l => l.id === 'bc');
  const bcThickness = bcLayer?.thickness ?? 0;

  // Adequate pavement thickness → less maintenance
  const thicknessScore = piecewiseMap(totalPavementThickness, [300, 500, 700, 1000], [30, 55, 75, 90]);
  // Adequate BC wearing course
  const bcScore = piecewiseMap(bcThickness, [0, 40, 60, 80], [20, 60, 80, 95]);
  // Drain helps avoid waterlogging → road lasts longer
  const drainBonus = hasDrain ? 10 : -5;
  // Wide roads cost more to maintain per km
  const widthPenalty = piecewiseMap(totalWidth, [7, 15, 25, 40], [0, 5, 10, 20]);

  return clamp(thicknessScore * 0.4 + bcScore * 0.4 + drainBonus - widthPenalty);
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export function computeWellbeingScores(
  project: StreetProject,
  totalPavementThickness: number,
  weights: WellbeingWeights = DEFAULT_WEIGHTS,
): WellbeingMetric[] {
  const { segments, pavementLayers, trafficVolume } = project;

  const metrics: WellbeingMetric[] = [
    {
      id: 'pedestrianSafety',
      label: 'Pedestrian Safety',
      icon: '🚶',
      score: Math.round(scorePedestrianSafety(segments, trafficVolume)),
      color: '',
      rationale: buildPedestrianRationale(segments, trafficVolume),
      category: 'safety',
      weight: weights.pedestrianSafety,
    },
    {
      id: 'airNoisePollution',
      label: 'Air & Noise Quality',
      icon: '🌿',
      score: Math.round(scoreAirNoisePollution(segments, trafficVolume)),
      color: '',
      rationale: buildPollutionRationale(segments, trafficVolume),
      category: 'environment',
      weight: weights.airNoisePollution,
    },
    {
      id: 'stormwaterManagement',
      label: 'Stormwater Mgmt',
      icon: '💧',
      score: Math.round(scoreStormwaterManagement(segments, pavementLayers)),
      color: '',
      rationale: buildStormwaterRationale(segments),
      category: 'environment',
      weight: weights.stormwaterManagement,
    },
    {
      id: 'urbanHeatIsland',
      label: 'Urban Heat Island',
      icon: '🌡',
      score: Math.round(scoreUrbanHeatIsland(segments)),
      color: '',
      rationale: buildHeatRationale(segments),
      category: 'environment',
      weight: weights.urbanHeatIsland,
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: '♿',
      score: Math.round(scoreAccessibility(segments)),
      color: '',
      rationale: buildAccessibilityRationale(segments),
      category: 'mobility',
      weight: weights.accessibility,
    },
    {
      id: 'activeTransport',
      label: 'Active Transport',
      icon: '🚲',
      score: Math.round(scoreActiveTransport(segments)),
      color: '',
      rationale: buildActiveTransportRationale(segments),
      category: 'mobility',
      weight: weights.activeTransport,
    },
    {
      id: 'maintenanceBurden',
      label: 'Maintenance Ease',
      icon: '🔧',
      score: Math.round(scoreMaintenanceBurden(segments, pavementLayers, totalPavementThickness)),
      color: '',
      rationale: buildMaintenanceRationale(segments, totalPavementThickness),
      category: 'maintenance',
      weight: weights.maintenanceBurden,
    },
  ];

  // Assign colors
  metrics.forEach(m => { m.color = scoreColor(m.score); });

  return metrics;
}

/**
 * Compute a single composite wellbeing score (0–100)
 * weighted average of all metrics.
 */
export function computeCompositeScore(metrics: WellbeingMetric[]): number {
  const totalWeight = metrics.reduce((acc, m) => acc + m.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = metrics.reduce((acc, m) => acc + m.score * m.weight, 0);
  return Math.round(weighted / totalWeight);
}

// ---------------------------------------------------------------------------
// Rationale builders
// ---------------------------------------------------------------------------

function buildPedestrianRationale(segments: StreetSegment[], tv: number): string {
  const fpW = segments.filter(s => s.type === 'footpath').reduce((a, s) => a + s.width, 0);
  const hasMedian = segments.some(s => s.type === 'median');
  const parts: string[] = [];
  if (fpW < 1.5) parts.push(`Footpath width ${fpW.toFixed(1)}m is below the 1.5m minimum`);
  else parts.push(`Footpath ${fpW.toFixed(1)}m${fpW >= 3 ? ' (good)' : ''}`);
  if (hasMedian) parts.push('physical separation via median');
  else parts.push('no median separation');
  if (tv > 2000) parts.push(`high traffic (${tv} CVPD) increases risk`);
  return parts.join('; ') + '.';
}

function buildPollutionRationale(segments: StreetSegment[], tv: number): string {
  const gw = segments.filter(s => ['green-buffer', 'median'].includes(s.type)).reduce((a, s) => a + s.width, 0);
  const hasCycle = segments.some(s => s.type === 'cycle-track');
  const parts = [`${tv} CVPD traffic`];
  if (gw > 0) parts.push(`${gw.toFixed(1)}m green cover provides noise/dust buffer`);
  if (hasCycle) parts.push('cycle track encourages low-emission trips');
  return parts.join('; ') + '.';
}

function buildStormwaterRationale(segments: StreetSegment[]): string {
  const gw = segments.filter(s => s.type === 'green-buffer').reduce((a, s) => a + s.width, 0);
  const hasDrain = segments.some(s => s.type === 'drain');
  const parts: string[] = [];
  if (gw > 0) parts.push(`${gw.toFixed(1)}m permeable green strips aid infiltration`);
  else parts.push('no green buffer — high runoff risk');
  if (hasDrain) parts.push('dedicated drain channel provided');
  else parts.push('no side drain');
  return parts.join('; ') + '.';
}

function buildHeatRationale(segments: StreetSegment[]): string {
  const totalWidth = segments.reduce((a, s) => a + s.width, 0);
  const gw = segments.filter(s => ['green-buffer', 'median'].includes(s.type)).reduce((a, s) => a + s.width, 0);
  const gr = totalWidth > 0 ? (gw / totalWidth * 100).toFixed(0) : '0';
  return `Green cover is ${gr}% of ROW. ${Number(gr) < 15 ? 'Increase green buffer to reduce UHI effect.' : 'Good green coverage mitigates heat island.'}`;
}

function buildAccessibilityRationale(segments: StreetSegment[]): string {
  const footpaths = segments.filter(s => s.type === 'footpath');
  const minFp = footpaths.length > 0 ? Math.min(...footpaths.map(s => s.width)) : 0;
  const hasCycle = segments.some(s => s.type === 'cycle-track');
  const parts: string[] = [];
  if (minFp < 1.8) parts.push(`Narrowest footpath ${minFp.toFixed(1)}m — below 1.8m wheelchair standard`);
  else parts.push('Footpath width meets wheelchair access (≥1.8m)');
  if (hasCycle) parts.push('cycle track improves inclusive mobility');
  return parts.join('; ') + '.';
}

function buildActiveTransportRationale(segments: StreetSegment[]): string {
  const cw = segments.filter(s => s.type === 'cycle-track').reduce((a, s) => a + s.width, 0);
  const fpW = segments.filter(s => s.type === 'footpath').reduce((a, s) => a + s.width, 0);
  if (cw === 0) return `No cycle track present. Add a dedicated cycle track (≥1.5m) to improve score. Footpath ${fpW.toFixed(1)}m supports walking.`;
  return `Cycle track ${cw.toFixed(1)}m${cw >= 2.5 ? ' (good)' : ' — widen to 2.5m for two-way use'}; footpath ${fpW.toFixed(1)}m.`;
}

function buildMaintenanceRationale(segments: StreetSegment[], thickness: number): string {
  const hasDrain = segments.some(s => s.type === 'drain');
  const parts = [`Total pavement ${thickness}mm`];
  if (!hasDrain) parts.push('no drain → water infiltration risk accelerates deterioration');
  else parts.push('drainage provided — extends pavement life');
  return parts.join('; ') + '.';
}
