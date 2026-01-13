import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

function Layout({ navItems }) {
  const location = useLocation();
  const [hoverItem, setHoverItem] = useState(null);

  return (
    <div className="app-shell">
      <aside className="sidebar">
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

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>Sistem aktif dan tersinkron</span>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
