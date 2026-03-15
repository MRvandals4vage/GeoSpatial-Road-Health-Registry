import { useEffect } from 'react';
import { useRoadStore } from '../store/roadStore';

/**
 * Fetches road data on mount and populates the global store.
 * Returns store-level loading / error state for consumers.
 */
export function useRoads() {
    const { fetchRoads, fetchAnalytics, fetchAlerts, isLoading, error, roads } = useRoadStore();

    useEffect(() => {
        const init = async () => {
            const currentRoads = useRoadStore.getState().roads;
            if (currentRoads.length === 0) {
                // If the DB is empty, trigger the backend's robust dataset generator first
                try {
                    await fetch('http://localhost:8080/api/generate-dataset');
                } catch(e) { console.error('Gen failed', e)}
            }
            await fetchRoads();
            fetchAnalytics();
            fetchAlerts();
        };
        init();
    }, [fetchRoads, fetchAnalytics, fetchAlerts]);

    return { roads, isLoading, error };
}
