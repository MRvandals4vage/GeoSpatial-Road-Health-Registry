import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Road, RoadFilters, AnalyticsSummary, Alert } from '../types/road';
import * as api from '../services/api';

interface RoadState {
    roads: Road[];
    selectedRoad: Road | null;
    isLoading: boolean;
    error: string | null;
    
    // Feature state
    isHeatmapMode: boolean;
    filters: RoadFilters;
    analytics: AnalyticsSummary | null;
    alerts: Alert[];
    
    // ── Mutators ────────────────────────────────────────
    setRoads: (roads: Road[]) => void;
    setSelectedRoad: (road: Road | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (msg: string | null) => void;
    setHeatmapMode: (mode: boolean) => void;
    setFilters: (filters: Partial<RoadFilters>) => void;
    
    // ── Async Actions ───────────────────────────────────
    fetchRoads: (bbox?: [number, number, number, number]) => Promise<void>;
    fetchAnalytics: () => Promise<void>;
    fetchAlerts: () => Promise<void>;
    submitInspection: (id: string, score: number, condition: 'GOOD'|'MODERATE'|'SEVERE', notes?: string) => Promise<void>;
    uploadImage: (roadId: string, file: File) => Promise<void>;
    submitComplaint: (formData: FormData) => Promise<void>;
}

export const useRoadStore = create<RoadState>()(
    devtools((set, get) => ({
        roads: [],
        selectedRoad: null,
        isLoading: false,
        error: null,
        
        isHeatmapMode: false,
        filters: {
            conditions: [],
            minScore: 0,
            maxScore: 100,
            types: [],
        },
        analytics: null,
        alerts: [],

        setRoads: (roads) => set({ roads }),
        setSelectedRoad: (road) => set({ selectedRoad: road }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (msg) => set({ error: msg }),
        setHeatmapMode: (mode) => set({ isHeatmapMode: mode }),
        
        setFilters: (newFilters) => {
            const filters = { ...get().filters, ...newFilters };
            set({ filters });
            get().fetchRoads(); // re-fetch with new filters
        },
        
        fetchRoads: async (bbox) => {
            set({ isLoading: true, error: null });
            try {
                const results = await api.fetchRoads(bbox, get().filters);
                set({ roads: results, isLoading: false });
                
                // If the selected road is no longer in results, unselect it
                const st = get();
                if (st.selectedRoad && !results.find(r => r.id === st.selectedRoad?.id)) {
                    set({ selectedRoad: null });
                }
            } catch (err: any) {
                set({ error: err.message || 'Failed to fetch roads', isLoading: false });
            }
        },

        fetchAnalytics: async () => {
            try {
                const summary = await api.fetchAnalyticsSummary();
                set({ analytics: summary });
            } catch (err: any) {
                console.error("fetchAnalytics error:", err);
            }
        },

        fetchAlerts: async () => {
             try {
                 const currentAlerts = await api.fetchAlerts();
                 set({ alerts: currentAlerts });
             } catch (err: any) {
                 console.error("fetchAlerts error:", err);
             }
        },

        submitInspection: async (id, score, condition, notes) => {
             set({ isLoading: true, error: null });
             try {
                const updatedRoad = await api.submitInspectionReport(id, score, condition, notes);
                const roads = [...get().roads];
                const index = roads.findIndex(r => r.id === id);
                if (index !== -1) {
                    roads[index] = updatedRoad;
                }
                set({ roads, selectedRoad: updatedRoad, isLoading: false });
                
                // Refresh analytics and alerts
                get().fetchAnalytics();
                get().fetchAlerts();
             } catch (err: any) {
                set({ error: err.message || 'Failed to submit inspection', isLoading: false });
             }
        },

        uploadImage: async (roadId, file) => {
            set({ isLoading: true, error: null });
            try {
                const result = await api.uploadRoadImage(roadId, file);
                console.log("CNN Prediction Result:", result);
                
                // Refresh roads to get updated condition
                await get().fetchRoads();
                await get().fetchAnalytics();
                set({ isLoading: false });
            } catch (err: any) {
                set({ error: err.message || 'Image analysis failed', isLoading: false });
            }
        },

        submitComplaint: async (formData: FormData) => {
            set({ isLoading: true, error: null });
            try {
                await api.submitComplaint(formData);
                console.log("Submitting complaint via Store...");
                
                // Refresh data
                await get().fetchRoads();
                await get().fetchAnalytics();
                set({ isLoading: false });
            } catch (err: any) {
                set({ error: 'Complaint submission failed', isLoading: false });
                throw err;
            }
        }
    }))
);

