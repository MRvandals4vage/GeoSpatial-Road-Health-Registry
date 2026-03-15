import axios from 'axios';
import type { Road, AnalyticsSummary, ConditionReport, Alert, RoadFilters } from '../types/road';

const API_BASE = 'http://localhost:8080/api';

export const submitComplaint = async (formData: FormData): Promise<any> => {
    const res = await axios.post(`${API_BASE}/complaints`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const fetchRoads = async (bbox?: [number, number, number, number], filters?: RoadFilters): Promise<Road[]> => {
    let url = `${API_BASE}/roads`;
    if (bbox) {
        url += `?bbox=${bbox.join(',')}`;
    }
    const res = await axios.get(url);
    let results = res.data.map((r: any): Road => ({
        id: r.roadId,
        name: r.name,
        type: r.type?.typeName || 'LOCAL',
        condition: r.currentCondition?.category || 'GOOD',
        conditionScore: r.currentCondition?.conditionScore || 100,
        path: r.coordinates || [],
        bbox: [0, 0, 0, 0], // Ignored on frontend right now
        lengthKm: 1, // Optional: Calculate distance properly
        lastInspected: r.currentCondition?.lastUpdated || new Date().toISOString(),
        history: []
    }));

    if (filters) {
        if (filters.conditions && filters.conditions.length > 0) {
            results = results.filter((r: Road) => filters.conditions.includes(r.condition));
        }
    }
    return results;
};

export const fetchRoadHistory = async (roadId: string): Promise<ConditionReport[]> => {
    const res = await axios.get(`${API_BASE}/roads/${roadId}/history`);
    return res.data;
};

export const fetchComplaints = async (): Promise<ConditionReport[]> => {
    const res = await axios.get(`${API_BASE}/complaints`);
    return res.data;
};

export const adminApproveComplaint = async (id: string): Promise<any> => {
    return (await axios.post(`${API_BASE}/admin/complaints/${id}/approve`)).data;
};

export const adminRejectComplaint = async (id: string): Promise<any> => {
    return (await axios.post(`${API_BASE}/admin/complaints/${id}/reject`)).data;
};

export const adminOverrideComplaint = async (id: string, newCondition: string): Promise<any> => {
    return (await axios.post(`${API_BASE}/admin/complaints/${id}/override?newCondition=${newCondition}`)).data;
};

export const adminDeleteComplaint = async (id: string): Promise<any> => {
    return (await axios.delete(`${API_BASE}/admin/complaints/${id}`)).data;
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
    const roads = await fetchRoads();

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
    // const res = await axios.get(`${API_BASE}/alerts`);
    return [];
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
