import React from 'react';
import { useRoadStore } from '../../store/roadStore';
import { formatCondition, formatScore, formatDate } from '../../utils/roadUtils';
import './MetricsPanel.css';

const MetricsPanel: React.FC = () => {
    const selectedRoad = useRoadStore((s) => s.selectedRoad);
    const analytics = useRoadStore((s) => s.analytics);
    const isLoading = useRoadStore((s) => s.isLoading);

    if (!analytics) {
        return (
            <aside className="metrics-panel">
                <div className="metrics-panel__empty-state">Loading metrics...</div>
            </aside>
        );
    }

    const { totalSegments, totalLengthKm, averageScore, conditionCounts, severeCount, maintenanceBacklog } = analytics;
    
    // Percentages
    const pctGood = totalSegments ? Math.round((conditionCounts.GOOD / totalSegments) * 100) : 0;
    const pctMod = totalSegments ? Math.round((conditionCounts.MODERATE / totalSegments) * 100) : 0;
    const pctSev = totalSegments ? Math.round((conditionCounts.SEVERE / totalSegments) * 100) : 0;

    return (
        <aside className="metrics-panel">
            {/* ── Header ─────────────────────────────────── */}
            <div className="panel-header">
                <span className="panel-header__icon">📊</span>
                <h2 className="panel-header__title">Network Metrics</h2>
            </div>

            <div className={`metrics-content ${isLoading ? 'loading-fade' : 'loading-enter'}`}>
                {/* ── Overview cards ─────────────────────────── */}
                <div className="metrics-panel__cards">
                    <StatCard label="Total Segments" value={String(totalSegments)} unit="" />
                    <StatCard label="Avg. Score" value={String(averageScore)} unit="/100" />
                    <StatCard label="Severe Roads" value={String(severeCount)} unit="" />
                </div>
                
                <div className="metrics-panel__cards" style={{ marginTop: '10px' }}>
                     <StatCard label="Total Length" value={totalLengthKm.toFixed(1)} unit="km" />
                     <StatCard label="Backlog" value={'$' + (maintenanceBacklog / 1000).toFixed(0) + 'k'} unit="est" />
                </div>

                {/* ── Condition breakdown ─────────────────────── */}
                <div className="metrics-panel__section">
                    <h3 className="section-label">Condition Breakdown</h3>
                    <ConditionBar label="Good" count={conditionCounts.GOOD} pct={pctGood} colorVar="--status-good" />
                    <ConditionBar label="Moderate" count={conditionCounts.MODERATE} pct={pctMod} colorVar="--status-moderate" />
                    <ConditionBar label="Severe" count={conditionCounts.SEVERE} pct={pctSev} colorVar="--status-severe" />
                </div>

                {/* ── Selected road detail ────────────────────── */}
                <div className="metrics-panel__section">
                    <h3 className="section-label">Selected Segment</h3>
                    {!selectedRoad ? (
                        <div className="metrics-panel__empty-state" style={{ marginTop: 0 }}>
                            <p className="empty-state__text">No segment selected.</p>
                        </div>
                    ) : (
                        <div className="detail-card">
                            <p className="detail-card__name">{selectedRoad.name}</p>
                            <DetailRow label="ID" value={selectedRoad.id} />
                            <DetailRow label="Condition" value={formatCondition(selectedRoad.condition)} />
                            <DetailRow label="Score" value={formatScore(selectedRoad.conditionScore)} />
                            <DetailRow label="Length" value={`${selectedRoad.lengthKm.toFixed(2)} km`} />
                            <DetailRow label="Inspected" value={formatDate(selectedRoad.lastInspected)} />
                            {selectedRoad.tags && (
                                <div className="detail-card__tags">
                                    {selectedRoad.tags.map((t) => (
                                        <span key={t} className="tag">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

// ── Sub-components ────────────────────────────────────────────────

interface StatCardProps { label: string; value: string; unit: string }
const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => (
    <div className="stat-card">
        <span className="stat-card__value">{value}<span className="stat-card__unit">{unit}</span></span>
        <span className="stat-card__label">{label}</span>
    </div>
);

interface ConditionBarProps { label: string; count: number; pct: number; colorVar: string }
const ConditionBar: React.FC<ConditionBarProps> = ({ label, count, pct, colorVar }) => {
    return (
        <div className="condition-bar">
            <div className="condition-bar__header">
                <span className="condition-bar__label">{label} ({pct}%)</span>
                <span className="condition-bar__count">{count}</span>
            </div>
            <div className="condition-bar__track">
                <div
                    className="condition-bar__fill"
                    style={{
                        width: `${pct}%`,
                        background: `var(${colorVar})`,
                    }}
                />
            </div>
        </div>
    );
};

interface DetailRowProps { label: string; value: string }
const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
    <div className="detail-row">
        <span className="detail-row__label">{label}</span>
        <span className="detail-row__value">{value}</span>
    </div>
);

export default MetricsPanel;
