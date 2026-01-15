import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import kkpLogo from '../kkp.png'

function Layout({ navItems }) {
  const navigate = useNavigate();
  const [hoverItem, setHoverItem] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';
  const namaEselon1 = localStorage.getItem('namaEselon1') || '';
  const namaEselon2 = localStorage.getItem('namaEselon2') || '';

  // Tentukan apakah user adalah operator
  const isOperator = userRole === 'operatorEselon1' || userRole === 'operatorEselon2';

  // Tentukan teks eselon yang ditampilkan
  const eselonName = userRole === 'operatorEselon1' ? namaEselon1 :
    userRole === 'operatorEselon2' ? namaEselon2 : '';

  // Tentukan profile path berdasarkan role (hanya untuk operator)
  const getProfilePath = () => {
    if (userRole === 'admin') return '/admin/profile';
    if (userRole === 'operatorEselon1') return '/operator-eselon1/profile';
    if (userRole === 'operatorEselon2') return '/operator-eselon2/profile';
    return '/profile'; // fallback
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dashboard':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
        );
      case 'master':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
        );
      case 'pengguna':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        );
      case 'aplikasi':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        );
      case 'laporan':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="m19 9-5 5-4-4-3 3"></path>
          </svg>
        );
      case 'audit':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 7h8"></path>
            <path d="M8 11h8"></path>
          </svg>
        );
      case 'logout':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="brand">
          <div className="brand-logo-container">
            <img src={kkpLogo} alt="KKP Logo" className="sidebar-logo" />
          </div>
          <div className="brand-badge">
            <span className="brand-badge-text">Nama Aplikasi</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const isHovered = hoverItem === item.label;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''} ${isHovered && !active ? 'hover' : ''}`}
                onMouseEnter={() => setHoverItem(item.label)}
                onMouseLeave={() => setHoverItem(null)}
              >
                <div className="nav-icon">{getIcon(item.icon)}</div>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}

          <button
            className="nav-item sign-out"
            onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={() => setHoverItem('Logout')}
            onMouseLeave={() => setHoverItem(null)}
          >
            <div className="nav-icon">{getIcon('logout')}</div>
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px'
        }}>
          <Link
            to={getProfilePath()}
            className="sidebar-profile-card"
          >
            <div className="sidebar-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="sidebar-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-eselon">
                {userRole === 'admin' ? 'Administrator' : (eselonName || 'Unit KKP')}
              </div>
            </div>
          </Link>

        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content logout-confirm">
            <div className="modal-icon-warning">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="modal-title">Konfirmasi Logout</h3>
            <p className="modal-text">Apakah kamu yakin ingin logout?</p>
            <div className="modal-actions">
              <button className="btn-no" onClick={() => setShowLogoutConfirm(false)}>Tidak</button>
              <button className="btn-yes" onClick={handleLogout}>Ya</button>
            </div>
          </div>
        </div>
      )}

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
