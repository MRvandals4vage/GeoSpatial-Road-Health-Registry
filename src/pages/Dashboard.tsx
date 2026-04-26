import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import MetricsPanel from '../components/panels/MetricsPanel';
import AnalyticsPanel from '../components/panels/AnalyticsPanel';
import MapView from '../components/map/MapView';
import { useRoads } from '../hooks/useRoads';
import './Dashboard.css';

/**
 * Main dashboard page – a three‑column layout with collapsible sidebars:
 *   left   → MetricsPanel (network stats)
 *   center → MapView (3‑D map with roads)
 *   right  → AnalyticsPanel (road list & legend)
 */
const Dashboard: React.FC = () => {
    // Initialise data loading on mount
    useRoads();

    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);

    return (
        <div className="dashboard">
            <Navbar />
            <div className={`dashboard__content ${!leftCollapsed ? 'left-panel-present' : ''} ${!rightCollapsed ? 'right-panel-present' : ''}`}>
                
                {/* Left Panel */}
                <aside className={`panel-container left-panel ${leftCollapsed ? 'panel-collapsed' : ''}`}>
                    <MetricsPanel />
                </aside>

                {/* Left Toggle */}
                <button 
                    className="panel-toggle toggle-left" 
                    onClick={() => setLeftCollapsed(!leftCollapsed)}
                    title={leftCollapsed ? "Expand Metrics" : "Collapse Metrics"}
                >
                    {leftCollapsed ? '≫' : '≪'}
                </button>

                {/* Main Map Area */}
                <main className="map-container-main">
                    <MapView />
                </main>

                {/* Right Toggle */}
                <button 
                    className="panel-toggle toggle-right" 
                    onClick={() => setRightCollapsed(!rightCollapsed)}
                    title={rightCollapsed ? "Expand Analytics" : "Collapse Analytics"}
                >
                    {rightCollapsed ? '≪' : '≫'}
                </button>

                {/* Right Panel */}
                <aside className={`panel-container right-panel ${rightCollapsed ? 'panel-collapsed' : ''}`}>
                    <AnalyticsPanel />
                </aside>

            </div>
        </div>
    );
};

export default Dashboard;
