import React from 'react';
import { useRoadStore } from '../../store/roadStore';
import { formatCondition } from '../../utils/roadUtils';
import type { Road } from '../../types';
import './AnalyticsPanel.css';

const AnalyticsPanel: React.FC = () => {
    const roads = useRoadStore((s) => s.roads);
    const selectedRoad = useRoadStore((s) => s.selectedRoad);
    const setSelected = useRoadStore((s) => s.setSelectedRoad);

    // Sort by conditionScore ascending (worst first)
    const sortedRoads = [...roads].sort((a, b) => a.conditionScore - b.conditionScore);

    return (
        <aside className="analytics-panel">
            {/* ── Header ─────────────────────────────────── */}
            <div className="panel-header">
                <span className="panel-header__icon">🛣️</span>
                <h2 className="panel-header__title">Road Registry</h2>
            </div>

            {/* ── Alert Banner ────────────────────────────── */}
            {roads.some((r) => r.condition === 'SEVERE') && (
                <div className="alert-banner">
                    <span className="alert-banner__icon">⚠️</span>
                    <span className="alert-banner__text">
                        {roads.filter((r) => r.condition === 'SEVERE').length} segment(s) in critical condition
                    </span>
                </div>
            )}

            {/* ── Road List ───────────────────────────────── */}
            <div className="road-list">
                {sortedRoads.length === 0 ? (
                    <p className="road-list__empty">Loading road data&hellip;</p>
                ) : (
                    sortedRoads.map((road) => (
                        <RoadListItem
                            key={road.id}
                            road={road}
                            isSelected={selectedRoad?.id === road.id}
                            onClick={() => setSelected(road.id === selectedRoad?.id ? null : road)}
                        />
                    ))
                )}
            </div>

            {/* ── Legend ──────────────────────────────────── */}
            <div className="legend">
                <h3 className="section-label">Legend</h3>
                <LegendItem color="var(--status-good)" label="Good (score ≥ 80)" />
                <LegendItem color="var(--status-moderate)" label="Moderate (score 40–79)" />
                <LegendItem color="var(--status-severe)" label="Severe (score < 40)" />
            </div>
        </aside>
    );
};

// ── Sub-components ────────────────────────────────────────────────

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
                    {formatCondition(road.condition)} &middot; {road.lengthKm} km
                </span>
            </div>
            <span className="road-item__score">{road.conditionScore}</span>
        </button>
    );
};

interface LegendItemProps { color: string; label: string }
const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => (
    <div className="legend-item">
        <span className="legend-item__swatch" style={{ background: color }} />
        <span className="legend-item__label">{label}</span>
    </div>
);

export default AnalyticsPanel;
