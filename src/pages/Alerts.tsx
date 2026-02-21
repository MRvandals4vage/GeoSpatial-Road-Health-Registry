import React from 'react';
import Navbar from '../components/layout/Navbar';
import './PlaceholderPage.css';

const Alerts: React.FC = () => {
    return (
        <div className="placeholder-page">
            <Navbar />
            <div className="placeholder-page__content">
                <div className="content-inner">
                    <span className="page-icon">🔔</span>
                    <h1>System Alerts</h1>
                    <p>Real-time notifications for critical road failures, severe weather impacts, and maintenance delays.</p>
                    <div className="alert-list-placeholder">
                        <div className="alert-item-skeleton">CRITICAL: NH-48 Segment 4 integrity drop detected (2 min ago)</div>
                        <div className="alert-item-skeleton">WARNING: Severe rain predicted for East Segment (45 min ago)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alerts;
