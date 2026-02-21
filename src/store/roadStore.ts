import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Road } from '../types/road';

/**
 * Global Zustand store for road data and UI state.
 * The store is deliberately tiny – it only holds the list of roads,
 * the currently selected road, and a few UI flags (loading / error).
 *
 * The `devtools` middleware enables Redux‑DevTools integration when
 * running the app locally, which is a huge help during development.
 */
interface RoadState {
    roads: Road[];
    selectedRoad: Road | null;
    isLoading: boolean;
    error: string | null;
    // ── Mutators ────────────────────────────────────────
    setRoads: (roads: Road[]) => void;
    setSelectedRoad: (road: Road | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (msg: string | null) => void;
}

export const useRoadStore = create<RoadState>()(
    devtools((set) => ({
        roads: [],
        selectedRoad: null,
        isLoading: false,
        error: null,
        setRoads: (roads) => set({ roads }),
        setSelectedRoad: (road) => set({ selectedRoad: road }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (msg) => set({ error: msg }),
    }))
);
