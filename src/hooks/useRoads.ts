import { useEffect } from 'react';
import { useRoadStore } from '../store/roadStore';
import * as api from '../services/api';

/**
 * Fetches road data on mount and populates the global store.
 * Returns store-level loading / error state for consumers.
 */
export function useRoads() {
    const { fetchRoads, fetchAnalytics, fetchAlerts, isLoading, error, roads } = useRoadStore();

    useEffect(() => {
        const init = async () => {
            await fetchRoads();
            const currentRoads = useRoadStore.getState().roads;
            if (currentRoads.length === 0) {
                const { mockRoads } = await import('../services/mockData');
                await api.seedBackend(mockRoads);
                await fetchRoads();
            }
            fetchAnalytics();
            fetchAlerts();
        };
        init();
    }, [fetchRoads, fetchAnalytics, fetchAlerts]);

    return { roads, isLoading, error };
}
