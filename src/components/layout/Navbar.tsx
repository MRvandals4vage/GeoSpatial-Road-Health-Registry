import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

const Navbar: React.FC = () => {
    const user = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
            <div className="navbar__left">
                <NavLink to="/" className="navbar__brand" style={{ textDecoration: 'none' }}>
                    <span className="navbar__icon">◈</span>
                    <span className="navbar__title">
                        Geo<span className="navbar__title--accent">Road</span>
                    </span>
                </NavLink>
                
                <nav className="navbar__nav">
                    <NavLink to="/" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Monitor</NavLink>
                    
                    {user?.role === 'USER' && (
                        <NavLink to="/complaints" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Reports</NavLink>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                        <NavLink to="/admin/complaints" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Review</NavLink>
                    )}

                    <NavLink to="/analytics" className={({ isActive }) => `navbar__pill ${isActive ? 'navbar__pill--active' : ''}`}>Analytics</NavLink>
                </nav>
            </div>

            {/* ── Right Meta ──────────────────────────────── */}
            <div className="navbar__meta">
                <span className="navbar__timestamp">{now}</span>
                <div className="user-info">
                    <span className="user-name">{user?.userName}</span>
                    <span className="user-role">{user?.role}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
                    <span>⏻</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
