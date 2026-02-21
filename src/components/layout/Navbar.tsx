import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    const now = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return (
        <header className="navbar">
            {/* ── Brand ───────────────────────────────────── */}
            <NavLink to="/" className="navbar__brand" style={{ textDecoration: 'none' }}>
                <span className="navbar__icon">⬡</span>
                <span className="navbar__title">
                    GeoRoad <span className="navbar__title--accent">Intelligence</span>
                </span>
                <span className="navbar__subtitle">Geospatial Road Condition Monitoring</span>
            </NavLink>

            {/* ── Centre Status ───────────────────────────── */}
            <nav className="navbar__nav">
                <NavLink to="/" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Dashboard</NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Analytics</NavLink>
                <NavLink to="/alerts" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Alerts</NavLink>
                <NavLink to="/reports" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Reports</NavLink>
            </nav>

            {/* ── Right Meta ──────────────────────────────── */}
            <div className="navbar__meta">
                <span className="navbar__status-dot" aria-label="System live" />
                <span className="navbar__status-label">LIVE</span>
                <span className="navbar__timestamp">{now}</span>
            </div>
        </header>
    );
};

export default Navbar;
