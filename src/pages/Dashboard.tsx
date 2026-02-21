import React from 'react';
import Navbar from '../components/layout/Navbar';
import MetricsPanel from '../components/panels/MetricsPanel';
import AnalyticsPanel from '../components/panels/AnalyticsPanel';
import MapView from '../components/map/MapView';
import { useRoads } from '../hooks/useRoads';
import './Dashboard.css';

/**
 * Main dashboard page – a three‑column layout:
 *   left   → MetricsPanel (network stats)
 *   center → MapView (3‑D map with roads)
 *   right  → AnalyticsPanel (road list & legend)
 */
const Dashboard: React.FC = () => {
    // Initialise data loading on mount
    useRoads();

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard__content">
                <MetricsPanel />
                <MapView />
                <AnalyticsPanel />
            </div>
        </div>
    );
};

export default Dashboard;
