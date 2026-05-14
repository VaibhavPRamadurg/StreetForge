/**
 * IRC & Design Constants
 * Single source of truth for all static engineering reference data.
 * Moving these here keeps component files clean and makes updates easy.
 */

import type { SegmentType } from '../types/street';

// ── Segment visual palette ──────────────────────────────────────────────────
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  carriageway:    '#3b82f6',
  footpath:       '#a16207',
  median:         '#16a34a',
  'cycle-track':  '#0ea5e9',
  parking:        '#b45309',
  'green-buffer': '#15803d',
  drain:          '#0369a1',
};

export const SEGMENT_LABELS: Record<SegmentType, string> = {
  carriageway:    'Carriageway',
  footpath:       'Footpath',
  median:         'Median',
  'cycle-track':  'Cycle Track',
  parking:        'Parking',
  'green-buffer': 'Green Buffer',
  drain:          'Drain',
};

export const SEGMENT_GRADIENTS: Record<SegmentType, string> = {
  carriageway:    'linear-gradient(180deg, #252e55 0%, #1a2040 100%)',
  footpath:       'linear-gradient(180deg, #4a3c30 0%, #362c24 100%)',
  median:         'linear-gradient(180deg, #1c5c34 0%, #144226 100%)',
  'cycle-track':  'linear-gradient(180deg, #0d3870 0%, #082660 100%)',
  parking:        'linear-gradient(180deg, #6a3210 0%, #4e2408 100%)',
  'green-buffer': 'linear-gradient(180deg, #1c4a30 0%, #123520 100%)',
  drain:          'linear-gradient(180deg, #0c2040 0%, #081530 100%)',
};

// ── Pavement layer visual palette (IRC:37-2012) ────────────────────────────
export const PAVEMENT_LAYER_COLORS: Record<string, string> = {
  bc:       '#1a1a2e',
  dbm:      '#2d3561',
  wmm:      '#4a3728',
  gsb:      '#8b6914',
  subgrade: '#6b4f2a',
};

export const PAVEMENT_LAYER_EMISSIVE: Record<string, string> = {
  bc:       '#00d4ff',
  dbm:      '#3b82f6',
  wmm:      '#f97316',
  gsb:      '#f59e0b',
  subgrade: '#92400e',
};

// Stagger heights in EXPLODED view (metres above surface base)
export const EXPLODE_OFFSETS = [4.8, 3.2, 2.0, 0.9, 0.0] as const;

// ── Underground utility definitions ────────────────────────────────────────
export const UNDERGROUND_UTILITIES = [
  { id: 'water',    label: 'Water Main (DN300)',     diameter: 0.30, color: '#0ea5e9', emissive: '#0ea5e9', xOffset: -3.5, depth: -1.2 },
  { id: 'sewer',    label: 'Sewer Line (DN450)',     diameter: 0.45, color: '#84cc16', emissive: '#84cc16', xOffset: -1.8, depth: -1.8 },
  { id: 'electric', label: 'HT Cable Duct (2×100)',  diameter: 0.15, color: '#fbbf24', emissive: '#fbbf24', xOffset:  0.5, depth: -0.9 },
  { id: 'telecom',  label: 'Telecom Conduit (OFC)',  diameter: 0.12, color: '#a855f7', emissive: '#a855f7', xOffset:  2.2, depth: -0.75 },
  { id: 'gas',      label: 'Gas Pipeline (DN200)',   diameter: 0.20, color: '#f97316', emissive: '#f97316', xOffset:  3.8, depth: -1.5 },
] as const;

// ── Road scene constants ─────────────────────────────────────────────────
export const ROAD_LENGTH = 40;   // Three.js units (1 unit = 1m)
export const SEG_DEPTH   = 0.065; // Surface slab height (m)

// ── IRC:103-2012 minimum widths (metres) ───────────────────────────────────
export const IRC_MIN_WIDTHS = {
  carriageway: {
    NH:  3.5,
    SH:  3.5,
    MDR: 3.0,
    ODR: 3.0,
    VR:  3.0,
  },
  footpath:    1.5,
  median:      1.2,
  cycleTrack:  1.5,
  parking:     2.5,
} as const;

// ── IRC:37-2012 design chart lookup (CBR × MSA → total thickness mm) ───────
// Rows = CBR %, Cols = MSA traffic bands
export const IRC37_CBR_KEYS   = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const IRC37_MSA_KEYS   = [1, 2, 5, 10, 20, 30, 50, 100, 150, 200] as const;
export const IRC37_TABLE: Record<number, Record<number, number>> = {
  2:  { 1:660, 2:710, 5:775, 10:840, 20:905, 30:940, 50:985,  100:1040, 150:1075, 200:1100 },
  3:  { 1:530, 2:575, 5:640, 10:700, 20:760, 30:795, 50:840,  100:895,  150:925,  200:950  },
  4:  { 1:450, 2:500, 5:560, 10:620, 20:680, 30:715, 50:760,  100:810,  150:840,  200:865  },
  5:  { 1:395, 2:440, 5:500, 10:555, 20:615, 30:645, 50:690,  100:740,  150:770,  200:790  },
  6:  { 1:355, 2:395, 5:450, 10:505, 20:560, 30:590, 50:635,  100:680,  150:710,  200:730  },
  7:  { 1:320, 2:360, 5:415, 10:465, 20:520, 30:550, 50:590,  100:635,  150:660,  200:680  },
  8:  { 1:295, 2:330, 5:385, 10:430, 20:485, 30:515, 50:555,  100:600,  150:625,  200:645  },
  9:  { 1:275, 2:310, 5:360, 10:405, 20:455, 30:485, 50:525,  100:570,  150:595,  200:615  },
  10: { 1:255, 2:290, 5:340, 10:385, 20:430, 30:460, 50:500,  100:545,  150:570,  200:590  },
};

// ── IRC road categories ─────────────────────────────────────────────────────
export const ROAD_CATEGORIES = ['NH', 'SH', 'MDR', 'ODR', 'VR'] as const;
export const CLIMATE_ZONES   = ['arid', 'semi-arid', 'humid', 'wet', 'hilly'] as const;

// ── Rational Method (IRC:SP:50) ─────────────────────────────────────────────
// Runoff coefficient C by surface type
export const RUNOFF_COEFFICIENTS = {
  carriageway:    0.90,
  footpath:       0.85,
  median:         0.35,
  'cycle-track':  0.80,
  parking:        0.85,
  'green-buffer': 0.25,
  drain:          1.00,
} as const;
