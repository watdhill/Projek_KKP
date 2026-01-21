import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import kkpLogo from "../kkp.png";

function Layout({ navItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverItem, setHoverItem] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "User";
  const namaEselon1 = localStorage.getItem("namaEselon1") || "";
  const namaEselon2 = localStorage.getItem("namaEselon2") || "";
  const namaUPT = localStorage.getItem("namaUPT") || "";

  // Tentukan apakah user adalah operator
  const isOperator =
    userRole === "operatorEselon1" || 
    userRole === "operatorEselon2" || 
    userRole === "operatorUPT";

  // Tentukan teks eselon yang ditampilkan
  const eselonName =
    userRole === "operatorEselon1"
      ? namaEselon1
      : userRole === "operatorEselon2"
      ? namaEselon2
      : userRole === "operatorUPT"
      ? namaUPT
      : "";

  // Tentukan profile path berdasarkan role (hanya untuk operator)
  const getProfilePath = () => {
    if (userRole === "admin") return "/admin/profile";
    if (userRole === "operatorEselon1") return "/operator-eselon1/profile";
    if (userRole === "operatorEselon2") return "/operator-eselon2/profile";
    if (userRole === "operatorUPT") return "/operator-upt/profile";
    return "/profile"; // fallback
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "dashboard":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        );
      case "master":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        );
      case "pengguna":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      case "aplikasi":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        );
      case "laporan":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        );
      case "audit":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        );
      case "logout":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`app-shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="brand">
          {!isCollapsed ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div className="brand-logo-container">
                <img src={kkpLogo} alt="KKP Logo" className="sidebar-logo" />
              </div>
              <div className="brand-badge">
                <span className="brand-badge-text">Nama Aplikasi</span>
              </div>
            </div>
          ) : null}

          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isHovered = hoverItem === item.label;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-item ${active ? "active" : ""} ${
                  isHovered && !active ? "hover" : ""
                }`}
                onMouseEnter={() => setHoverItem(item.label)}
                onMouseLeave={() => setHoverItem(null)}
                title={isCollapsed ? item.label : ""}
              >
                <div className="nav-icon">{getIcon(item.icon)}</div>
                {!isCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </Link>
            );
          })}

          <button
            className="nav-item sign-out"
            onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={() => setHoverItem("Logout")}
            onMouseLeave={() => setHoverItem(null)}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="nav-icon">{getIcon("logout")}</div>
            {!isCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </nav>

        {!isCollapsed && (
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "12px",
            }}
          >
            <Link to={getProfilePath()} className="sidebar-profile-card">
              <div className="sidebar-avatar">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="sidebar-info">
                <div className="sidebar-user-name">{userName}</div>
                <div className="sidebar-user-eselon">
                  {userRole === "admin"
                    ? "Administrator"
                    : eselonName || "Unit KKP"}
                </div>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content logout-confirm">
            <div className="modal-icon-warning">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="modal-title">Konfirmasi Logout</h3>
            <p className="modal-text">Apakah kamu yakin ingin logout?</p>
            <div className="modal-actions">
              <button
                className="btn-no"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Tidak
              </button>
              <button className="btn-yes" onClick={handleLogout}>
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
