// ─── Road Condition Enum ────────────────────────────────────────────────────

export type RoadCondition = 'GOOD' | 'MODERATE' | 'SEVERE';

// ─── Core Road Type ─────────────────────────────────────────────────────────

export interface Road {
  id: string;
  name: string;
  condition: RoadCondition;
  /** GeoJSON-style path: array of [lng, lat] coordinates */
  path: [number, number][];
  /** Length of the road segment in kilometers */
  lengthKm: number;
  /** Last inspection timestamp (ISO string) */
  lastInspected: string;
  /** Condition score 0–100 (100 = perfect) */
  conditionScore: number;
  /** Optional metadata tags */
  tags?: string[];
}

// ─── Hover / Selection Info ──────────────────────────────────────────────────

export interface HoveredRoad {
  road: Road;
  /** Screen coordinates of the hover event */
  x: number;
  y: number;
}

// ─── Condition Colour Mapping ─────────────────────────────────────────────────

export const CONDITION_COLOR: Record<RoadCondition, [number, number, number, number]> = {
  GOOD:     [34,  197,  94, 220],   // Green
  MODERATE: [234, 179,   8, 220],   // Yellow
  SEVERE:   [239,  68,  68, 220],   // Red
};

export const CONDITION_HIGHLIGHT: Record<RoadCondition, [number, number, number, number]> = {
  GOOD:     [74,  222, 128, 255],
  MODERATE: [253, 224,  71, 255],
  SEVERE:   [248, 113, 113, 255],
};
