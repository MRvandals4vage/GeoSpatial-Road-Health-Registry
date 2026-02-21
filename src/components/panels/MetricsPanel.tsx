import React from 'react';
import { useRoadStore } from '../../store/roadStore';
import { formatCondition, formatScore, formatDate } from '../../utils/roadUtils';
import './MetricsPanel.css';

const MetricsPanel: React.FC = () => {
    const roads = useRoadStore((s) => s.roads);
    const selectedRoad = useRoadStore((s) => s.selectedRoad);

    // ── Derived stats ───────────────────────────────
    const total = roads.length;
    const good = roads.filter((r) => r.condition === 'GOOD').length;
    const moderate = roads.filter((r) => r.condition === 'MODERATE').length;
    const severe = roads.filter((r) => r.condition === 'SEVERE').length;
    const totalKm = roads.reduce((sum, r) => sum + r.lengthKm, 0).toFixed(1);
    const avgScore = total
        ? Math.round(roads.reduce((s, r) => s + r.conditionScore, 0) / total)
        : 0;

    return (
        <aside className="metrics-panel">
            {/* ── Header ─────────────────────────────────── */}
            <div className="panel-header">
                <span className="panel-header__icon">📊</span>
                <h2 className="panel-header__title">Network Metrics</h2>
            </div>

            {!selectedRoad ? (
                <div className="metrics-panel__empty-state">
                    <div className="empty-state__icon">📍</div>
                    <p className="empty-state__text">No area specified.</p>
                    <p className="empty-state__subtext">Select a road segment on the map to view real‑time monitoring metrics and condition analysis.</p>
                </div>
            ) : (
                <>
                    {/* ── Overview cards ─────────────────────────── */}
                    <div className="metrics-panel__cards">
                        <StatCard label="Total Segments" value={String(total)} unit="roads" />
                        <StatCard label="Total Coverage" value={totalKm} unit="km" />
                        <StatCard label="Avg. Score" value={String(avgScore)} unit="/100" />
                    </div>

                    {/* ── Condition breakdown ─────────────────────── */}
                    <div className="metrics-panel__section">
                        <h3 className="section-label">Condition Breakdown</h3>
                        <ConditionBar label="Good" count={good} total={total} colorVar="--status-good" />
                        <ConditionBar label="Moderate" count={moderate} total={total} colorVar="--status-moderate" />
                        <ConditionBar label="Severe" count={severe} total={total} colorVar="--status-severe" />
                    </div>

                    {/* ── Selected road detail ────────────────────── */}
                    <div className="metrics-panel__section">
                        <h3 className="section-label">Selected Segment</h3>
                        <div className="detail-card">
                            <p className="detail-card__name">{selectedRoad.name}</p>
                            <DetailRow label="ID" value={selectedRoad.id} />
                            <DetailRow label="Condition" value={formatCondition(selectedRoad.condition)} />
                            <DetailRow label="Score" value={formatScore(selectedRoad.conditionScore)} />
                            <DetailRow label="Length" value={`${selectedRoad.lengthKm} km`} />
                            <DetailRow label="Inspected" value={formatDate(selectedRoad.lastInspected)} />
                            {selectedRoad.tags && (
                                <div className="detail-card__tags">
                                    {selectedRoad.tags.map((t) => (
                                        <span key={t} className="tag">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
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

interface ConditionBarProps { label: string; count: number; total: number; colorVar: string }
const ConditionBar: React.FC<ConditionBarProps> = ({ label, count, total, colorVar }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="condition-bar">
            <div className="condition-bar__header">
                <span className="condition-bar__label">{label}</span>
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
