import { create } from 'zustand';
import type { StreetProject, StreetSegment, ViewMode } from '../types/street';
import { calculateDesignTraffic, calculatePavementThickness, generatePavementLayers, calculateDrainage, checkIRCCompliance, generateBoQ } from '../utils/ircCalc';
import type { ComplianceCheck, BoQItem } from '../types/street';

const DEFAULT_SEGMENTS: StreetSegment[] = [
  { id: 'fp-l', type: 'footpath', label: 'Footpath (L)', width: 2.0 },
  { id: 'cw-l', type: 'carriageway', label: 'Carriageway (L)', width: 7.0, lanes: 2 },
  { id: 'med', type: 'median', label: 'Central Median', width: 1.5 },
  { id: 'cw-r', type: 'carriageway', label: 'Carriageway (R)', width: 7.0, lanes: 2 },
  { id: 'fp-r', type: 'footpath', label: 'Footpath (R)', width: 2.0 },
];

interface StreetStore {
  project: StreetProject;
  viewMode: ViewMode;
  showGrid: boolean;
  showDimensions: boolean;
  showLabels: boolean;
  activePanel: 'pavement' | 'drainage' | 'compliance' | 'boq' | 'ai';
  roadLength: number;
  complianceChecks: ComplianceCheck[];
  boqItems: BoQItem[];
  designMSA: number;
  totalPavementThickness: number;
  drainageDischarge: number;

  setViewMode: (mode: ViewMode) => void;
  toggleGrid: () => void;
  toggleDimensions: () => void;
  toggleLabels: () => void;
  setActivePanel: (panel: StreetStore['activePanel']) => void;
  updateProject: (patch: Partial<StreetProject>) => void;
  updateSegment: (id: string, patch: Partial<StreetSegment>) => void;
  addSegment: (seg: StreetSegment) => void;
  removeSegment: (id: string) => void;
  reorderSegments: (segments: StreetSegment[]) => void;
  setRoadLength: (len: number) => void;
  recalculate: () => void;
}

function buildInitialProject(): StreetProject {
  const msa = calculateDesignTraffic(500, 20);
  const thick = calculatePavementThickness(4, msa);
  const layers = generatePavementLayers(thick, 'humid');
  return {
    id: `proj-${Date.now()}`,
    name: 'Urban Arterial Road — Pune',
    location: 'Pune, Maharashtra',
    roadCategory: 'MDR',
    climateZone: 'humid',
    designLife: 20,
    cbr: 4,
    trafficVolume: 500,
    segments: DEFAULT_SEGMENTS,
    pavementLayers: layers,
    drainage: { catchmentArea: 2.5, runoffCoefficient: 0.7, rainfallIntensity: 75, slope: 2.0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const initialProject = buildInitialProject();
const initMSA = calculateDesignTraffic(initialProject.trafficVolume, initialProject.designLife);
const initThick = calculatePavementThickness(initialProject.cbr, initMSA);
const initChecks = checkIRCCompliance(initialProject.segments, initialProject.roadCategory, initialProject.pavementLayers);
const initBoQ = generateBoQ(initialProject.segments, initialProject.pavementLayers, 500);
const initDischarge = calculateDrainage(initialProject.drainage);

export const useStreetStore = create<StreetStore>((set, get) => ({
  project: initialProject,
  viewMode: 'surface',
  showGrid: true,
  showDimensions: true,
  showLabels: true,
  activePanel: 'pavement',
  roadLength: 500,
  complianceChecks: initChecks,
  boqItems: initBoQ,
  designMSA: initMSA,
  totalPavementThickness: initThick,
  drainageDischarge: initDischarge,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleDimensions: () => set(s => ({ showDimensions: !s.showDimensions })),
  toggleLabels: () => set(s => ({ showLabels: !s.showLabels })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setRoadLength: (len) => set({ roadLength: len }),

  updateProject: (patch) => {
    set(s => ({ project: { ...s.project, ...patch, updatedAt: new Date().toISOString() } }));
    get().recalculate();
  },

  updateSegment: (id, patch) => {
    set(s => ({
      project: {
        ...s.project,
        segments: s.project.segments.map(seg => seg.id === id ? { ...seg, ...patch } : seg),
        updatedAt: new Date().toISOString(),
      }
    }));
    get().recalculate();
  },

  addSegment: (seg) => {
    set(s => ({ project: { ...s.project, segments: [...s.project.segments, seg], updatedAt: new Date().toISOString() } }));
    get().recalculate();
  },

  removeSegment: (id) => {
    set(s => ({ project: { ...s.project, segments: s.project.segments.filter(sg => sg.id !== id), updatedAt: new Date().toISOString() } }));
    get().recalculate();
  },

  reorderSegments: (segments) => {
    set(s => ({ project: { ...s.project, segments, updatedAt: new Date().toISOString() } }));
    get().recalculate();
  },

  recalculate: () => {
    const { project, roadLength } = get();
    const msa = calculateDesignTraffic(project.trafficVolume, project.designLife);
    const thick = calculatePavementThickness(project.cbr, msa);
    const layers = generatePavementLayers(thick, project.climateZone);
    const checks = checkIRCCompliance(project.segments, project.roadCategory, layers);
    const boq = generateBoQ(project.segments, layers, roadLength);
    const discharge = calculateDrainage(project.drainage);
    set({
      designMSA: msa,
      totalPavementThickness: thick,
      complianceChecks: checks,
      boqItems: boq,
      drainageDischarge: discharge,
      project: { ...project, pavementLayers: layers, updatedAt: new Date().toISOString() },
    });
  },
}));
