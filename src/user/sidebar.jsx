import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, closeSidebar, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "show" : ""}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <i className="bi bi-lightning-charge-fill"></i>
          </div>

          <div className="logo-text">
            <h3>SubtoUse</h3>
            <span>VTU Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className={`nav-item ${
              isActive("/dashboard") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-grid-fill"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/airtime"
            className={`nav-item ${
              isActive("/airtime") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-phone-fill"></i>
            <span>Airtime</span>
          </Link>

          <Link
            to="/data"
            className={`nav-item ${
              isActive("/data") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-wifi"></i>
            <span>Data Bundle</span>
          </Link>

          <Link
            to="/electricity"
            className={`nav-item ${
              isActive("/electricity") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-lightning-fill"></i>
            <span>Electricity</span>
          </Link>

          <Link
            to="/cable"
            className={`nav-item ${
              isActive("/cable") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-tv-fill"></i>
            <span>Cable TV</span>
          </Link>

          <Link
            to="/wallet"
            className={`nav-item ${
              isActive("/wallet") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-wallet2"></i>
            <span>Wallet</span>
          </Link>

          <Link
            to="/transactions"
            className={`nav-item ${
              isActive("/transactions") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-clock-history"></i>
            <span>Transactions</span>
          </Link>

          <Link
            to="/profile"
            className={`nav-item ${
              isActive("/profile") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <i className="bi bi-person-circle"></i>
            <span>Profile</span>
          </Link>

        </nav>

        {/* Logout */}
        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            type="button"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;