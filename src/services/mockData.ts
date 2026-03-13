import type { Road, RoadCondition, RoadType, ConditionReport, Alert } from '../types/road';

const center: [number, number] = [77.1025, 28.7041]; // New Delhi

function randomGaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateHistory(roadId: string, currentScore: number): ConditionReport[] {
    const history: ConditionReport[] = [];
    const numReports = Math.floor(Math.random() * 5) + 1; // 1 to 5 past reports
    let score = currentScore;
    
    // go backward in time
    let date = new Date();
    for (let i = 0; i < numReports; i++) {
        date = new Date(date.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 60); // 0 to 60 days ago
        let cat: RoadCondition = 'GOOD';
        if (score < 40) cat = 'SEVERE';
        else if (score < 75) cat = 'MODERATE';
        
        history.push({
            id: `rep_${roadId}_${i}`,
            roadId,
            conditionScore: score,
            conditionCategory: cat,
            timestamp: date.toISOString(),
            source: Math.random() > 0.3 ? 'AI' : 'MANUAL',
            notes: Math.random() > 0.5 ? 'Routine inspection' : 'Reported pothole'
        });
        
        // score used to be better in the past
        score = Math.min(100, score + Math.random() * 15);
    }
    
    return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function generateMockRoads(count: number): Road[] {
    const roads: Road[] = [];
    for (let i = 0; i < count; i++) {
        const id = `road_${i}`;
        const name = `Segment ${i}`;
        const type: RoadType = ['HIGHWAY', 'ARTERIAL', 'LOCAL', 'RESIDENTIAL'][Math.floor(Math.random() * 4)] as RoadType;
        
        // condition based on normal distribution
        const gaussian = randomGaussian(); // mean 0, std 1
        let score = Math.round(75 + gaussian * 15);
        score = Math.max(0, Math.min(100, score)); // clamp 0-100
        
        let condition: RoadCondition = 'GOOD';
        if (score < 40) condition = 'SEVERE';
        else if (score < 75) condition = 'MODERATE';
        
        // Generate path
        const path: [number, number][] = [];
        let lng = center[0] + randomGaussian() * 0.1;
        let lat = center[1] + randomGaussian() * 0.1;
        let minLng = lng, maxLng = lng, minLat = lat, maxLat = lat;
        
        const points = Math.floor(Math.random() * 5) + 2;
        for (let p = 0; p < points; p++) {
            path.push([lng, lat]);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            
            lng += (Math.random() - 0.5) * 0.005;
            lat += (Math.random() - 0.5) * 0.005;
        }
        
        const bbox: [number, number, number, number] = [minLng, minLat, maxLng, maxLat];
        
        // approx length in km
        const dx = (maxLng - minLng) * 111;
        const dy = (maxLat - minLat) * 111;
        const lengthKm = Math.sqrt(dx*dx + dy*dy) + 0.1;
        
        const history = generateHistory(id, score);
        
        roads.push({
            id,
            name,
            type,
            condition,
            path,
            bbox,
            lengthKm,
            lastInspected: history[history.length - 1].timestamp,
            conditionScore: score,
            tags: ['tag1', 'tag2'],
            history
        });
    }
    return roads;
}

// Generate data once
export const mockRoads = generateMockRoads(1000); // Demo dataset with 1000 segments
export const mockAlerts: Alert[] = mockRoads
    .filter(r => r.condition === 'SEVERE')
    .slice(0, 20)
    .map(r => ({
        id: `alert_${r.id}`,
        roadId: r.id,
        roadName: r.name,
        severity: r.conditionScore < 20 ? 'HIGH' : (r.conditionScore < 30 ? 'MEDIUM' : 'LOW'),
        previousScore: r.history.length > 1 ? r.history[r.history.length - 2].conditionScore : r.conditionScore + 10,
        currentScore: r.conditionScore,
        timestamp: r.lastInspected,
        resolved: false
    }));
