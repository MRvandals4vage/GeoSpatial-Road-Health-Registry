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
            { name: 'Good', value: analytics.conditionCounts.GOOD, color: '#10b981' },
            { name: 'Moderate', value: analytics.conditionCounts.MODERATE, color: '#f59e0b' },
            { name: 'Severe', value: analytics.conditionCounts.SEVERE, color: '#8B0000' }
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
        <div className="placeholder-page" style={{ overflowY: 'auto', display: 'block', background: '#000', fontFamily: 'Barlow, sans-serif' }}>
            <Navbar />
            <div className="placeholder-page__content" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
                <div className="content-inner" style={{ textAlign: 'left', maxWidth: 'none' }}>
                    <h1 style={{ marginBottom: '30px', color: 'var(--accent-silver)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Barlow Condensed, sans-serif' }}>
                        <span className="page-icon" style={{ display: 'inline', fontSize: '2rem', marginRight: '15px' }}>📈</span> Network Analytics
                    </h1>
                    
                    <div className="analytics-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
                        gap: '20px',
                        marginBottom: '40px' 
                    }}>
                        {/* Condition Distribution */}
                        <div className="analytics-card" style={{ background: '#0a0a0a', padding: '25px', borderRadius: '2px', border: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Condition Distribution</h3>
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
                                        <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '2px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Road Type distribution */}
                        <div className="analytics-card" style={{ background: '#0a0a0a', padding: '25px', borderRadius: '2px', border: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Infrastructure Composition</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={typeDistribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis type="number" stroke="#666" fontSize={10} />
                                        <YAxis dataKey="name" type="category" stroke="#666" width={100} fontSize={10} />
                                        <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '2px' }} />
                                        <Bar dataKey="value" fill="var(--accent-red)" radius={[0, 2, 2, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                         <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '2px', border: '1px solid var(--border-subtle)' }}>
                             <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maintenance Backlog</div>
                             <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-red)', marginTop: '5px', fontFamily: 'Barlow Condensed, sans-serif' }}>
                                 ${analytics ? (analytics.maintenanceBacklog / 1000000).toFixed(1) : 0}M
                             </div>
                         </div>
                         <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '2px', border: '1px solid var(--border-subtle)' }}>
                             <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg Network Health</div>
                             <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '5px', fontFamily: 'Barlow Condensed, sans-serif' }}>
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
