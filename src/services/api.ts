import type { Road } from '../types';

// ─── Static Mock Road Data ────────────────────────────────────────────────────
// Coordinates centred around New Delhi (lng, lat) — replace with real data later.

const MOCK_ROADS: Road[] = [
    {
        id: 'road-001',
        name: 'NH-48 Corridor North',
        condition: 'GOOD',
        path: [
            [77.1025, 28.7041],
            [77.1100, 28.7120],
            [77.1200, 28.7200],
            [77.1300, 28.7290],
            [77.1420, 28.7380],
        ],
        lengthKm: 4.2,
        lastInspected: '2025-02-15T08:30:00Z',
        conditionScore: 88,
        tags: ['national-highway', 'urban'],
    },
    {
        id: 'road-002',
        name: 'Ring Road East Segment',
        condition: 'MODERATE',
        path: [
            [77.2090, 28.6800],
            [77.2200, 28.6750],
            [77.2350, 28.6700],
            [77.2500, 28.6690],
            [77.2650, 28.6710],
        ],
        lengthKm: 3.8,
        lastInspected: '2025-02-10T11:00:00Z',
        conditionScore: 57,
        tags: ['ring-road', 'high-traffic'],
    },
    {
        id: 'road-003',
        name: 'Outer Ring Road South',
        condition: 'SEVERE',
        path: [
            [77.0700, 28.6200],
            [77.0900, 28.6150],
            [77.1100, 28.6100],
            [77.1300, 28.6080],
            [77.1500, 28.6050],
        ],
        lengthKm: 5.1,
        lastInspected: '2025-01-28T09:45:00Z',
        conditionScore: 21,
        tags: ['outer-ring', 'damaged'],
    },
    {
        id: 'road-004',
        name: 'Central Business District Link',
        condition: 'GOOD',
        path: [
            [77.2090, 28.6280],
            [77.2150, 28.6320],
            [77.2200, 28.6360],
            [77.2250, 28.6400],
        ],
        lengthKm: 1.6,
        lastInspected: '2025-02-18T07:00:00Z',
        conditionScore: 93,
        tags: ['cbd', 'priority'],
    },
    {
        id: 'road-005',
        name: 'Airport Express Connector',
        condition: 'MODERATE',
        path: [
            [77.0850, 28.5500],
            [77.0950, 28.5600],
            [77.1050, 28.5700],
            [77.1150, 28.5800],
            [77.1250, 28.5920],
        ],
        lengthKm: 6.3,
        lastInspected: '2025-02-05T14:20:00Z',
        conditionScore: 62,
        tags: ['airport', 'express'],
    },
    {
        id: 'road-006',
        name: 'Industrial Zone North Access',
        condition: 'SEVERE',
        path: [
            [77.3200, 28.7500],
            [77.3300, 28.7450],
            [77.3400, 28.7400],
            [77.3500, 28.7350],
        ],
        lengthKm: 2.9,
        lastInspected: '2025-01-15T10:10:00Z',
        conditionScore: 14,
        tags: ['industrial', 'heavy-load'],
    },
];

// ─── API Service Stub ─────────────────────────────────────────────────────────

/**
 * Fetch all road segments.
 * Swap the body with a real Axios call once the backend is ready:
 *
 *   const response = await axios.get<Road[]>('/api/roads');
 *   return response.data;
 */
export async function fetchRoads(): Promise<Road[]> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_ROADS;
}

/**
 * Fetch a single road by ID.
 */
export async function fetchRoadById(id: string): Promise<Road | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ROADS.find((r) => r.id === id);
}
