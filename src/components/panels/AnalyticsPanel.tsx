import React, { useState, useMemo } from 'react';
import { useRoadStore } from '../../store/roadStore';
import { formatCondition } from '../../utils/roadUtils';
import type { Road, RoadCondition, RoadType } from '../../types/road';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './AnalyticsPanel.css';

const AnalyticsPanel: React.FC = () => {
    const roads = useRoadStore((s) => s.roads) as Road[];
    const selectedRoad = useRoadStore((s) => s.selectedRoad) as Road | null;
    const setSelected = useRoadStore((s) => s.setSelectedRoad) as (road: Road | null) => void;
    const isHeatmapMode = useRoadStore((s) => s.isHeatmapMode);
    const setHeatmapMode = useRoadStore((s) => s.setHeatmapMode);
    const filters = useRoadStore((s) => s.filters);
    const setFilters = useRoadStore((s) => s.setFilters);
    const submitInspection = useRoadStore((s) => s.submitInspection);
    const isLoading = useRoadStore((s) => s.isLoading);

    const [isInspecting, setIsInspecting] = useState(false);
    const [scoreInput, setScoreInput] = useState<number>(100);
    const [conditionInput, setConditionInput] = useState<RoadCondition>('GOOD');
    const [notesInput, setNotesInput] = useState('');

    const sortedRoads = useMemo<Road[]>(() => {
        return [...roads].sort((a, b) => a.conditionScore - b.conditionScore).slice(0, 100);
    }, [roads]);

    const handleFilterChange = (field: keyof typeof filters, value: any) => {
        setFilters({ [field]: value });
    };

    const handleInspectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRoad) {
            await submitInspection(selectedRoad.id, scoreInput, conditionInput, notesInput);
            setIsInspecting(false);
            setNotesInput('');
        }
    };

    const handleConditionToggle = (c: RoadCondition) => {
        const current = filters.conditions || [];
        const next = current.includes(c) ? current.filter(x => x !== c) : [...current, c];
        handleFilterChange('conditions', next);
    };

    const handleTypeToggle = (t: RoadType) => {
        const current = filters.types || [];
        const next = current.includes(t) ? current.filter(x => x !== t) : [...current, t];
        handleFilterChange('types', next);
    };

    // If road selected, show road details + history chart + inspection form
    if (selectedRoad) {
        const chartData = selectedRoad.history?.map(h => ({
            date: new Date(h.timestamp).toLocaleDateString(),
            score: h.conditionScore
        })) || [];

        return (
            <aside className="analytics-panel">
                <div className="panel-header">
                    <button className="back-btn" onClick={() => setSelected(null)}>← Back</button>
                    <h2 className="panel-header__title">Segment Details</h2>
                </div>

                <div className="analytics-content">
                    <h3 className="section-label">{selectedRoad.name}</h3>
                    
                    <div className="premium-gauge">
                        <svg viewBox="0 0 100 60" className="gauge-svg">
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#2d3748" strokeWidth="8" strokeLinecap="round" />
                            <path 
                                d="M 10 50 A 40 40 0 0 1 90 50" 
                                fill="none" 
                                stroke="var(--accent-cyan)" 
                                strokeWidth="8" 
                                strokeLinecap="round" 
                                strokeDasharray="125.6"
                                strokeDashoffset={125.6 * (1 - selectedRoad.conditionScore / 100)}
                                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            />
                        </svg>
                        <div className="gauge-value">{selectedRoad.conditionScore}</div>
                        <div className="gauge-label">Condition Index</div>
                    </div>

                    <div className="status-badge" data-status={selectedRoad.condition}>
                        {formatCondition(selectedRoad.condition)} - Risk: {selectedRoad.condition === 'SEVERE' ? 'CRITICAL' : selectedRoad.condition === 'MODERATE' ? 'ELEVATED' : 'NOMINAL'}
                    </div>

                    <div className="history-chart" style={{ height: '180px', marginTop: '10px' }}>
                        <h4 style={{marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b'}}>Condition Trend</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis domain={[0, 100]} hide />
                                <RechartsTooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}}
                                    itemStyle={{color: '#4fd1c5'}}
                                />
                                <Line type="monotone" dataKey="score" stroke="#4fd1c5" strokeWidth={3} dot={{ r: 4, fill: '#4fd1c5' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {!isInspecting ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="inspect-btn" onClick={() => {
                                setIsInspecting(true);
                                setScoreInput(selectedRoad.conditionScore);
                                setConditionInput(selectedRoad.condition);
                            }}>
                                + Log Manual Inspection
                            </button>
                            
                            <div className="ai-analysis-box" style={{ 
                                background: 'rgba(79, 209, 197, 0.05)', 
                                border: '1px solid rgba(79, 209, 197, 0.2)', 
                                borderRadius: '12px', 
                                padding: '15px' 
                            }}>
                                <h4 style={{ fontSize: '0.8rem', color: '#4fd1c5', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🤖</span> AI Image Analysis (CNN)
                                </h4>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '12px' }}>
                                    Upload a road image to automatically detect damage using the RoadNet CNN model.
                                </p>
                                <input 
                                    type="file" 
                                    id="cnn-upload" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) useRoadStore.getState().uploadImage(selectedRoad.id, file);
                                    }}
                                />
                                <label htmlFor="cnn-upload" className="mode-btn active" style={{ display: 'block', cursor: 'pointer', fontSize: '0.8rem', padding: '10px' }}>
                                    {isLoading ? 'Processing Image...' : 'Select Road Image'}
                                </label>
                            </div>
                        </div>
                    ) : (
                        <form className="inspection-form animate-slide-up" onSubmit={handleInspectionSubmit}>
                            <h4 style={{fontSize: '0.8rem', color: '#4fd1c5', marginBottom: '5px'}}>Report Submission</h4>
                            <label>
                                Health Score ({scoreInput})
                                <input type="range" min="0" max="100" value={scoreInput} onChange={e => setScoreInput(Number(e.target.value))} />
                            </label>
                            <label>
                                Category
                                <select value={conditionInput} onChange={e => setConditionInput(e.target.value as RoadCondition)}>
                                    <option value="GOOD">Good</option>
                                    <option value="MODERATE">Moderate</option>
                                    <option value="SEVERE">Severe</option>
                                </select>
                            </label>
                            <label>
                                Attachment
                                <div className="mock-upload">
                                    <input type="file" accept="image/*" style={{ fontSize: '0.7rem' }} />
                                </div>
                            </label>
                            <textarea placeholder="Observation notes..." value={notesInput} onChange={e => setNotesInput(e.target.value)} rows={2} style={{background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: 'white', padding: '8px', fontSize: '0.8rem'}} />
                            <div className="form-actions">
                                <button type="button" onClick={() => setIsInspecting(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" style={{background: '#4fd1c5', color: '#020617'}}>Submit</button>
                            </div>
                        </form>
                    )}
                </div>
            </aside>
        );
    }

    const isRoadSelected = (roadId: string) => {
        if (!selectedRoad) return false;
        return (selectedRoad as any).id === roadId;
    };

    const handleRoadClick = (r: Road) => {
        setSelected(isRoadSelected(r.id) ? null : r);
    };

    return (
        <aside className="analytics-panel">
            <div className="panel-header">
                <span className="panel-header__icon">🛰️</span>
                <h2 className="panel-header__title">Infrastructure Intel</h2>
            </div>
            
            <div className="controls-section">
                <div className="toggle-container">
                    <label className="toggle-label">Render Engine</label>
                    <div className="switch-wrapper">
                        <button className={`mode-btn ${!isHeatmapMode ? 'active' : ''}`} onClick={() => setHeatmapMode(false)}>Network</button>
                        <button className={`mode-btn ${isHeatmapMode ? 'active' : ''}`} onClick={() => setHeatmapMode(true)}>Heatmap</button>
                    </div>
                </div>

                <div className="filters-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label className="toggle-label">Asset Type</label>
                        <div className="filter-chips">
                            {(['HIGHWAY', 'ARTERIAL', 'LOCAL'] as RoadType[]).map(t => (
                                <button 
                                    key={t}
                                    className={`filter-chip ${filters.types?.includes(t) ? 'active' : ''}`}
                                    onClick={() => handleTypeToggle(t)}
                                >
                                    {t.charAt(0) + t.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="toggle-label">Health Spectrum</label>
                        <div className="filter-chips">
                            {(['GOOD', 'MODERATE', 'SEVERE'] as RoadCondition[]).map(c => (
                                <button 
                                    key={c}
                                    className={`filter-chip ${filters.conditions?.includes(c) ? 'active' : ''}`}
                                    onClick={() => handleConditionToggle(c)}
                                    data-cond={c}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="toggle-label">Geographic Partition</label>
                        <select 
                            className="area-select"
                            value={filters.area || 'ALL'} 
                            onChange={(e) => handleFilterChange('area', e.target.value)}
                        >
                            <option value="ALL">All Sectors</option>
                            <option value="NORTH">North Sector</option>
                            <option value="SOUTH">South Sector</option>
                            <option value="EAST">East Sector</option>
                            <option value="WEST">West Sector</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="road-list">
                <h3 className="section-label" style={{marginTop: '15px'}}>Worst Segments ({roads.length} total)</h3>
                {sortedRoads.length === 0 ? (
                    <p className="road-list__empty">No roads match filters.</p>
                ) : (
                    sortedRoads.map((road: Road) => (
                        <RoadListItem
                            key={road.id}
                            road={road}
                            isSelected={isRoadSelected(road.id)}
                            onClick={() => handleRoadClick(road)}
                        />
                    ))
                )}
            </div>
        </aside>
    );
};

interface RoadListItemProps {
    road: Road;
    isSelected: boolean;
    onClick: () => void;
}
const RoadListItem: React.FC<RoadListItemProps> = ({ road, isSelected, onClick }) => {
    const conditionClass = `road-item--${road.condition.toLowerCase()}`;
    return (
        <button
            className={`road-item ${conditionClass} ${isSelected ? 'road-item--selected' : ''}`}
            onClick={onClick}
            title={road.name}
        >
            <div className="road-item__indicator" />
            <div className="road-item__body">
                <span className="road-item__name">{road.name}</span>
                <span className="road-item__meta">
                    {formatCondition(road.condition)} &middot; {road.lengthKm.toFixed(1)} km
                </span>
            </div>
            <span className="road-item__score">{road.conditionScore}</span>
        </button>
    );
};

export default AnalyticsPanel;
