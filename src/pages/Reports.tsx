import React from 'react';
import Navbar from '../components/layout/Navbar';
import './PlaceholderPage.css';

const Reports: React.FC = () => {
    return (
        <div className="placeholder-page">
            <Navbar />
            <div className="placeholder-page__content">
                <div className="content-inner">
                    <span className="page-icon">📄</span>
                    <h1>Audit Reports</h1>
                    <p>PDF/CSV export engine for generation of official inspection reports and infrastructure compliance certificates.</p>
                    <button className="placeholder-button">Generate Monthly Report</button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
