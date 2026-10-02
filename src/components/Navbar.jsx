import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="custom-navbar">
      <div className="nav-wrapper">

        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-main">VTU</span>
          <span className="brand-sub">MobileSub</span>
        </Link>

        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-item" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/Login" className="nav-item" onClick={closeMenu}>
            Login
          </Link>

          <Link to="/Register" className="nav-item" onClick={closeMenu}>
            Register
          </Link>

          <Link to="/Contact" className="contact-btn" onClick={closeMenu}>
            Contact Us
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;