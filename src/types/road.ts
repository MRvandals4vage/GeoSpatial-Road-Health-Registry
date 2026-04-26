// ─── Road Condition Enum ────────────────────────────────────────────────────

export type RoadCondition = 'GOOD' | 'MODERATE' | 'SEVERE';
export type RoadType = 'HIGHWAY' | 'ARTERIAL' | 'LOCAL' | 'RESIDENTIAL';

// ─── Condition History ──────────────────────────────────────────────────────

export interface ConditionReport {
  reportId: string;
  road?: Road;
  user?: any;
  predictedCondition: RoadCondition;
  confidenceScore: number;
  userComment?: string;
  imagePath?: string;
  reportedAt: string; // ISO string
  coordinates?: [number, number];
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  roadId: string;
  roadName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  previousScore: number;
  currentScore: number;
  timestamp: string;
  resolved: boolean;
}

// ─── Core Road Type ─────────────────────────────────────────────────────────

export interface Road {
  id: string;
  name: string;
  type: RoadType;
  condition: RoadCondition;
  /** GeoJSON-style path: array of [lng, lat] coordinates */
  path: [number, number][];
  /** Bounding box [minLng, minLat, maxLng, maxLat] for fast queries */
  bbox: [number, number, number, number];
  /** Length of the road segment in kilometers */
  lengthKm: number;
  /** Last inspection timestamp (ISO string) */
  lastInspected: string;
  /** Condition score 0–100 (100 = perfect) */
  conditionScore: number;
  /** Optional metadata tags */
  tags?: string[];
  /** Historical condition reports for this road */
  history: ConditionReport[];
}

// ─── Filters ────────────────────────────────────────────────────────────────

export interface RoadFilters {
  conditions: RoadCondition[];
  minScore: number;
  maxScore: number;
  types: RoadType[];
  area?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'ALL';
}

// ─── Hover / Selection Info ──────────────────────────────────────────────────

export interface HoveredRoad {
  road: Road;
  /** Screen coordinates of the hover event */
  x: number;
  y: number;
}

// ─── Analytics Summary ───────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalSegments: number;
  totalLengthKm: number;
  conditionCounts: Record<RoadCondition, number>;
  averageScore: number;
  severeCount: number;
  maintenanceBacklog: number; // estimated cost or count
}

// ─── Condition Colour Mapping ─────────────────────────────────────────────────

export const CONDITION_COLOR: Record<RoadCondition, [number, number, number, number]> = {
  GOOD:     [16,  185, 129, 200],   // Minimalist Green
  MODERATE: [245, 158,  11, 200],   // Minimalist Amber
  SEVERE:   [139,   0,   0, 230],   // Blood Red
};

export const CONDITION_HIGHLIGHT: Record<RoadCondition, [number, number, number, number]> = {
  GOOD:     [52,  211, 153, 255],
  MODERATE: [251, 191,  36, 255],
  SEVERE:   [185,  28,  28, 255],   // Brighter Blood Red
};
