import React, { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { useRoadStore } from '../store/roadStore';
import * as api from '../services/api';
import './AdminComplaints.css';

const AdminComplaints: React.FC = () => {
    const complaints = useRoadStore((s) => s.complaints);
    const fetchComplaints = useRoadStore((s) => s.fetchComplaints);
    
    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'DELETE') => {
        try {
            if (action === 'APPROVE') {
                await api.adminApproveComplaint(id);
            } else if (action === 'REJECT') {
                await api.adminRejectComplaint(id);
            } else if (action === 'DELETE') {
                await api.adminDeleteComplaint(id);
            }
            fetchComplaints(); // refresh data
        } catch (e) {
            console.error("Failed to perform action", e);
            alert("Action failed to execute.");
        }
    };

    const handleOverride = async (id: string) => {
        const condition = prompt("Enter override condition (GOOD, MODERATE, SEVERE):");
        if (condition && ['GOOD', 'MODERATE', 'SEVERE'].includes(condition.toUpperCase())) {
            try {
                await api.adminOverrideComplaint(id, condition.toUpperCase());
                fetchComplaints();
            } catch (e) {
                console.error(e);
                alert("Failed to override.");
            }
        }
    };

    const pendingComplaints = complaints.filter((c: any) => c.status === 'PENDING').slice(0, 50);

    return (
        <div className="admin-complaints-page">
            <Navbar />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>User Complaints Review</h1>
                    <div className="admin-stats">
                        <div className="stat-pill">Pending Reviews: {complaints.filter((c: any) => c.status === 'PENDING').length}</div>
                        <div className="stat-pill urgent">Severe: {pendingComplaints.filter(c => c.predictedCondition === 'SEVERE').length}</div>
                    </div>
                </header>

                <div className="complaints-grid">
                    {pendingComplaints.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No complaints found.</p>
                    ) : (
                        pendingComplaints.map(c => (
                            <div key={c.reportId} className="complaint-card glass-panel animate-slide-up">
                                <div className="complaint-card__img">
                                    {c.imagePath ? (
                                        <img src={`http://localhost:8080/${c.imagePath}`} alt="Complaint evidence" />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>No Image</div>
                                    )}
                                    <div className={`prediction-tag ${c.predictedCondition}`}>
                                        {c.predictedCondition} {Math.round(c.confidenceScore * 100)}%
                                    </div>
                                </div>
                                
                                <div className="complaint-card__body">
                                    <h3>{c.road?.name || 'Unknown Road Segment'}</h3>
                                    <p className="complaint-card__time">Reported: {new Date(c.reportedAt).toLocaleString()}</p>
                                    <p className="complaint-card__comment">"{c.userComment || 'No additional comments.'}"</p>
                                    {(c as any).status && <p className="complaint-card__comment" style={{color: '#4fd1c5', marginTop: '5px'}}>Status: {(c as any).status}</p>}
                                    {c.coordinates && <p className="complaint-card__comment" style={{fontSize: '0.65rem', marginTop: '5px'}}>GPS: {c.coordinates[1].toFixed(5)}, {c.coordinates[0].toFixed(5)}</p>}
                                    
                                    <div className="admin-actions" style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '15px'}}>
                                        <button className="resolve-btn" onClick={() => handleAction(c.reportId, 'APPROVE')} style={{flex: 1, minWidth: '45%'}}>Approve</button>
                                        <button className="delete-btn" onClick={() => handleAction(c.reportId, 'REJECT')} style={{flex: 1, minWidth: '45%'}}>Reject</button>
                                        <button className="override-btn" onClick={() => handleOverride(c.reportId)} style={{flex: 1, minWidth: '45%'}}>Override AI</button>
                                        <button className="override-btn" style={{background: '#7f1d1d', color: '#fca5a5', border: 'none', flex: 1, minWidth: '45%'}} onClick={() => handleAction(c.reportId, 'DELETE')}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminComplaints;
