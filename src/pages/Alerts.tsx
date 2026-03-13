import React, { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { useRoadStore } from '../store/roadStore';
import './PlaceholderPage.css';

const Alerts: React.FC = () => {
    const alerts = useRoadStore(s => s.alerts);
    const fetchAlerts = useRoadStore(s => s.fetchAlerts);

    useEffect(() => {
        fetchAlerts();
        // Since we fetch alerts individually, we also fetch roads on mount or just trust that they are there if coming from map
    }, [fetchAlerts]);

    return (
        <div className="placeholder-page" style={{ alignItems: 'flex-start', paddingTop: '80px', overflowY: 'auto' }}>
            <Navbar />
            <div className="placeholder-page__content" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <div className="content-inner" style={{ textAlign: 'left', padding: '40px' }}>
                    <h1 style={{ marginBottom: '20px' }}><span className="page-icon" style={{ fontSize: '2rem', marginRight: '10px' }}>🚨</span> System Alerts</h1>
                    <p style={{ marginBottom: '30px', color: '#94a3b8' }}>Real-time notifications for critical road failures and condition drops below thresholds.</p>
                    
                    {alerts.length === 0 ? (
                        <div className="alert-list-placeholder">
                            <p>No active alerts. The road network is currently stable.</p>
                        </div>
                    ) : (
                        <div className="alerts-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {alerts.map(alert => (
                                <div key={alert.id} className="alert-card" style={{
                                    background: '#1e293b', 
                                    padding: '20px', 
                                    borderRadius: '12px', 
                                    borderLeft: `4px solid ${alert.severity === 'HIGH' ? '#ef4444' : alert.severity === 'MEDIUM' ? '#f97316' : '#eab308'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>{alert.roadName}</h3>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            background: alert.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                            color: alert.severity === 'HIGH' ? '#fca5a5' : '#fde047'
                                        }}>
                                            {alert.severity} SEVERITY
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 10px 0', color: '#cbd5e1' }}>
                                        Condition score dropped from <strong>{alert.previousScore}</strong> to <strong>{alert.currentScore}</strong>.
                                    </p>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Reported: {new Date(alert.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alerts;
