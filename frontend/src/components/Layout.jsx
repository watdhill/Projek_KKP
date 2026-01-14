import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

function Layout({ navItems }) {
  const location = useLocation();
  const [hoverItem, setHoverItem] = useState(null);
  const userRole = localStorage.getItem('userRole');
  
  // Tentukan apakah user adalah operator
  const isOperator = userRole === 'operatorEselon1' || userRole === 'operatorEselon2';
  
  // Tentukan profile path berdasarkan role (hanya untuk operator)
  const getProfilePath = () => {
    if (userRole === 'operatorEselon1') return '/operator-eselon1/profile';
    if (userRole === 'operatorEselon2') return '/operator-eselon2/profile';
    return '/profile'; // fallback
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="brand">
          <div className="brand-logo">KKP</div>
          <div>
            <div className="brand-name">Projek KKP</div>
            <div className="brand-subtitle">Portal pengelolaan data</div>
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
                <span className="nav-label">{item.label}</span>
                <span className="nav-arrow">›</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ 
          marginTop: 'auto',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px'
        }}>
          {isOperator && (
            <Link 
              to={getProfilePath()} 
              className="sidebar-footer"
              style={{ 
                textDecoration: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#475569',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profile Saya</span>
            </Link>
          )}
          
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center',
            padding: '8px 0'
          }}>
            Versi 1.0.0
          </div>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
