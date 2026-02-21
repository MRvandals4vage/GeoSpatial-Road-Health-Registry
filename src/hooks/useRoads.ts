import { useEffect } from 'react';
import { fetchRoads } from '../services/api';
import { useRoadStore } from '../store/roadStore';

/**
 * Fetches road data on mount and populates the global store.
 * Returns store-level loading / error state for consumers.
 */
export function useRoads() {
    const { setRoads, setLoading, setError, isLoading, error, roads } = useRoadStore();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchRoads();
                if (!cancelled) setRoads(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [setRoads, setLoading, setError]);

    return { roads, isLoading, error };
}
