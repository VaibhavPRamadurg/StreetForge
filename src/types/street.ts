export type ClimateZone = 'arid' | 'semi-arid' | 'humid' | 'wet' | 'hilly';
export type RoadCategory = 'NH' | 'SH' | 'MDR' | 'ODR' | 'VR';
export type SegmentType = 'carriageway' | 'footpath' | 'median' | 'cycle-track' | 'parking' | 'green-buffer' | 'drain';
export type ViewMode = 'surface' | 'exploded';

export const ROAD_CATEGORY_LABELS: Record<RoadCategory, string> = {
  NH: 'National Highway', SH: 'State Highway',
  MDR: 'Major District Road', ODR: 'Other District Road', VR: 'Village Road',
};
export const CLIMATE_ZONE_LABELS: Record<ClimateZone, string> = {
  'arid': 'Arid (Zone I)', 'semi-arid': 'Semi-Arid (Zone II)',
  'humid': 'Humid (Zone III)', 'wet': 'Wet (Zone IV)', 'hilly': 'Hilly (Zone V)',
};
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  carriageway: '#2d3561', footpath: '#5c4a3a', median: '#15803d',
  'cycle-track': '#0369a1', parking: '#b45309', 'green-buffer': '#166534', drain: '#1e40af',
};
export const SEGMENT_LABELS: Record<SegmentType, string> = {
  carriageway: 'Carriageway', footpath: 'Footpath', median: 'Median',
  'cycle-track': 'Cycle Track', parking: 'Parking Lane',
  'green-buffer': 'Green Buffer', drain: 'Side Drain',
};

export interface StreetSegment {
  id: string; type: SegmentType; label: string; width: number; lanes?: number;
}
export interface PavementLayer {
  id: string; name: string; shortName: string;
  thickness: number; material: string; color: string; irc_ref: string;
}
export interface DrainageData {
  catchmentArea: number; runoffCoefficient: number;
  rainfallIntensity: number; slope: number;
}
export interface StreetProject {
  id: string; name: string; location: string;
  roadCategory: RoadCategory; climateZone: ClimateZone;
  designLife: number; cbr: number; trafficVolume: number;
  segments: StreetSegment[]; pavementLayers: PavementLayer[];
  drainage: DrainageData; createdAt: string; updatedAt: string;
}
export interface ComplianceCheck {
  id: string; name: string; standard: string;
  required: string; actual: string; status: 'pass' | 'fail' | 'warning'; description: string;
}
export interface BoQItem {
  id: string; description: string; unit: string;
  quantity: number; rate: number; amount: number; irc_ref?: string;
}
