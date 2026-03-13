import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import './AdminComplaints.css';

interface Complaint {
    id: string;
    roadName: string;
    predictedCondition: 'GOOD' | 'MODERATE' | 'SEVERE';
    confidence: number;
    userComment: string;
    timestamp: string;
    imageUrl: string;
}

const mockComplaints: Complaint[] = [
    {
        id: '1',
        roadName: 'Segment 442',
        predictedCondition: 'SEVERE',
        confidence: 0.9423,
        userComment: 'Huge pothole after rain',
        timestamp: '2026-03-14 01:20',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300'
    },
    {
        id: '1',
        roadName: 'Arterial North 12',
        predictedCondition: 'MODERATE',
        confidence: 0.8122,
        userComment: 'Markings are fading',
        timestamp: '2026-03-14 00:45',
        imageUrl: 'https://images.unsplash.com/photo-1542640244-7e672d6cef21?w=300'
    }
];

const AdminComplaints: React.FC = () => {
    const [complaints, setComplaints] = useState(mockComplaints);

    const handleResolve = (id: string) => {
        setComplaints(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="admin-complaints-page">
            <Navbar />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>User Complaints Review</h1>
                    <div className="admin-stats">
                        <div className="stat-pill">Pending: {complaints.length}</div>
                        <div className="stat-pill urgent">Severe: {complaints.filter(c => c.predictedCondition === 'SEVERE').length}</div>
                    </div>
                </header>

                <div className="complaints-grid">
                    {complaints.map(c => (
                        <div key={c.id} className="complaint-card glass-panel animate-slide-up">
                            <div className="complaint-card__img">
                                <img src={c.imageUrl} alt="Complaint evidence" />
                                <div className={`prediction-tag ${c.predictedCondition}`}>
                                    {c.predictedCondition} {Math.round(c.confidence * 100)}%
                                </div>
                            </div>
                            
                            <div className="complaint-card__body">
                                <h3>{c.roadName}</h3>
                                <p className="complaint-card__time">Reported: {c.timestamp}</p>
                                <p className="complaint-card__comment">"{c.userComment}"</p>
                                
                                <div className="admin-actions">
                                    <button className="resolve-btn" onClick={() => handleResolve(c.id)}>Resolve</button>
                                    <button className="override-btn">Override AI</button>
                                    <button className="delete-btn">Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminComplaints;
