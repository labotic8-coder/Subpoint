import { Link } from "react-router-dom";
import "./Header.css";

function Header({ openSidebar }) {

  const savedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = savedUser ? JSON.parse(savedUser) : {};
  } catch (error) {
    console.error("Invalid user data:", error);
    user = {};
  }

  return (
    <header className="dashboard-header">

      {/* ==================================================
          TOP ROW
      ================================================== */}

      <div className="header-top">

        {/* LEFT */}
        <div className="header-left">

          <button
            className="menu-btn"
            onClick={openSidebar}
            type="button"
            aria-label="Open menu"
          >
            <i className="bi bi-list"></i>
          </button>

          <div className="header-title">

            <h2>Dashboard</h2>

            <p>
              Welcome back, {user?.username || "User"} 👋
            </p>

          </div>

        </div>


        {/* RIGHT */}
        <div className="header-actions">

          {/* NOTIFICATION */}
          <button
            className="notification-btn"
            type="button"
            aria-label="Notifications"
          >

            <i className="bi bi-bell-fill"></i>

            <span className="notification-dot"></span>

          </button>


          {/* HOME */}
          <Link
            to="/"
            className="dashboard-home-btn"
            aria-label="Home"
          >
            <i className="bi bi-house-fill"></i>
            <span>Home</span>
          </Link>


          {/* PROFILE */}
          <div className="user-profile">

            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="User"
            />

            <div className="user-info">

              <h6>
                {user?.username || "User"}
              </h6>

              <span>
                Premium Member
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="search-box">

        <i className="bi bi-search"></i>

        <input
          type="text"
          placeholder="Search..."
          aria-label="Search dashboard"
        />

      </div>

    </header>
  );
}

export default Header;