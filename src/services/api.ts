import axios from 'axios';
import type { Road, AnalyticsSummary, ConditionReport, Alert, RoadFilters } from '../types/road';

const API_BASE = 'http://localhost:3001/api';

export const fetchRoads = async (_bbox?: [number, number, number, number], filters?: RoadFilters): Promise<Road[]> => {
    const res = await axios.get(`${API_BASE}/roads`);
    let results = res.data;

    if (filters) {
        if (filters.conditions && filters.conditions.length > 0) {
            results = results.filter((r: any) => filters.conditions.includes(r.condition));
        }
    }
    return results;
};

export const fetchRoadHistory = async (roadId: string): Promise<ConditionReport[]> => {
    const res = await axios.get(`${API_BASE}/roads/${roadId}/history`);
    return res.data;
};

export const uploadRoadImage = async (roadId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('roadId', roadId);
    
    const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
    const res = await axios.get(`${API_BASE}/roads`);
    const roads = res.data;

    const totalSegments = roads.length;
    let totalLengthKm = 0;
    const conditionCounts = { GOOD: 0, MODERATE: 0, SEVERE: 0 };
    let totalScore = 0;
    
    roads.forEach((r: any) => {
        totalLengthKm += r.lengthKm || 1;
        conditionCounts[r.condition as keyof typeof conditionCounts]++;
        totalScore += r.conditionScore;
    });

    return {
        totalSegments,
        totalLengthKm,
        conditionCounts,
        averageScore: totalSegments ? Math.round(totalScore / totalSegments) : 0,
        severeCount: conditionCounts.SEVERE,
        maintenanceBacklog: conditionCounts.SEVERE * 15000
    };
};

export const fetchAlerts = async (): Promise<Alert[]> => {
    const res = await axios.get(`${API_BASE}/alerts`);
    return res.data;
};

export const seedBackend = async (roads: Road[]) => {
    await axios.post(`${API_BASE}/seed`, { roads });
};

export const submitInspectionReport = async (
    roadId: string, 
    _score: number, 
    _condition: 'GOOD' | 'MODERATE' | 'SEVERE', 
    _notes?: string
): Promise<Road> => {
    // This could also be an API call to a new endpoint
    const res = await axios.post(`${API_BASE}/upload`, { roadId }); // Fallback or placeholder
    return res.data;
};
