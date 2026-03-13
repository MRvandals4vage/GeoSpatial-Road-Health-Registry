import React, { useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import { useRoadStore } from '../store/roadStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './PlaceholderPage.css';

const Analytics: React.FC = () => {
    const analytics = useRoadStore(s => s.analytics);
    const roads = useRoadStore(s => s.roads);

    const conditionData = useMemo(() => {
        if (!analytics) return [];
        return [
            { name: 'Good', value: analytics.conditionCounts.GOOD, color: '#22c55e' },
            { name: 'Moderate', value: analytics.conditionCounts.MODERATE, color: '#eab308' },
            { name: 'Severe', value: analytics.conditionCounts.SEVERE, color: '#ef4444' }
        ];
    }, [analytics]);

    const typeDistribution = useMemo(() => {
        const dist: Record<string, number> = {};
        roads.forEach(r => {
            dist[r.type] = (dist[r.type] || 0) + 1;
        });
        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    }, [roads]);

    return (
        <div className="placeholder-page" style={{ overflowY: 'auto', display: 'block' }}>
            <Navbar />
            <div className="placeholder-page__content" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
                <div className="content-inner" style={{ textAlign: 'left', maxWidth: 'none' }}>
                    <h1 style={{ marginBottom: '30px' }}><span className="page-icon" style={{ display: 'inline', fontSize: '2rem', marginRight: '15px' }}>📈</span> Network Analytics</h1>
                    
                    <div className="analytics-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
                        gap: '20px',
                        marginBottom: '40px' 
                    }}>
                        {/* Condition Distribution */}
                        <div className="analytics-card" style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ marginBottom: '20px', color: '#cbd5e1' }}>Condition Distribution</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={conditionData}
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {conditionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Road Type distribution */}
                        <div className="analytics-card" style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ marginBottom: '20px', color: '#cbd5e1' }}>Infrastructure Composition</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={typeDistribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis type="number" stroke="#94a3b8" />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                                        <Bar dataKey="value" fill="#4fd1c5" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                         <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                             <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Maintenance Backlog</div>
                             <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginTop: '5px' }}>
                                 ${analytics ? (analytics.maintenanceBacklog / 1000000).toFixed(1) : 0}M
                             </div>
                         </div>
                         <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                             <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Avg Network Health</div>
                             <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginTop: '5px' }}>
                                 {analytics?.averageScore}%
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Analytics;
