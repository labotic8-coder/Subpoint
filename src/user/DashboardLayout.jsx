import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./Header";
import "./Dashboard.css";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">

      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">

        <Header
          openSidebar={() => setSidebarOpen(true)}
        />

        <div className="dashboard-page-content">
          {children}
        </div>

      </main>

    </div>
  );
}

export default DashboardLayout;