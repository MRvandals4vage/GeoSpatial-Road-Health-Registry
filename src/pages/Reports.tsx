import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import './PlaceholderPage.css';

interface Report {
    id: string;
    name: string;
    date: string;
    type: 'PDF' | 'CSV';
    status: 'READY' | 'GENERATING';
}

const Reports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([
        { id: '1', name: 'Monthly Infrastructure Audit - Feb 2026', date: '2026-03-01', type: 'PDF', status: 'READY' },
        { id: '2', name: 'NH-48 Condition Assessment', date: '2026-03-05', type: 'CSV', status: 'READY' },
    ]);

    const handleGenerate = () => {
        const newReport: Report = {
            id: Date.now().toString(),
            name: `System Generated Report - ${new Date().toLocaleDateString()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'PDF',
            status: 'GENERATING'
        };
        setReports([newReport, ...reports]);
        setTimeout(() => {
            setReports(prev => prev.map(r => r.id === newReport.id ? { ...r, status: 'READY' } : r));
        }, 2000);
    };

    return (
        <div className="placeholder-page" style={{ overflowY: 'auto', display: 'block' }}>
            <Navbar />
            <div className="placeholder-page__content" style={{ display: 'block', maxWidth: '1000px', margin: '0 auto', paddingTop: '80px' }}>
                <div className="content-inner" style={{ textAlign: 'left', maxWidth: 'none', padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h1 style={{ marginBottom: '10px' }}><span className="page-icon" style={{ display: 'inline', fontSize: '2rem', marginRight: '15px' }}>📄</span> Audit Reports</h1>
                            <p style={{ margin: 0, color: '#94a3b8' }}>Generate and manage infrastructure compliance certificates and audit logs.</p>
                        </div>
                        <button className="placeholder-button" onClick={handleGenerate} style={{ cursor: 'pointer' }}>
                            + Generate Monthly Report
                        </button>
                    </div>

                    <div className="report-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {reports.map(report => (
                            <div key={report.id} style={{ 
                                background: '#1e293b', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-subtle)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc', marginBottom: '5px' }}>{report.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Generated on: {report.date} &middot; format: {report.type}</div>
                                </div>
                                <div>
                                    {report.status === 'GENERATING' ? (
                                        <span style={{ color: '#4fd1c5', fontSize: '0.9rem', fontStyle: 'italic' }}>Generating...</span>
                                    ) : (
                                        <button 
                                            onClick={() => alert(`Downloading ${report.name}...`)}
                                            style={{ 
                                                padding: '8px 20px', 
                                                border: '1px solid #4fd1c5', 
                                                color: '#4fd1c5', 
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
