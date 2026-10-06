import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
   const response = await fetch(
  "http://beamaxtechpractical.online/API/admin.php/admin_login.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
      password: password,
    }),
  }
);

      const data = await response.json();

      if (data.success) {
        // Save admin information locally
        localStorage.setItem("admin", JSON.stringify(data.admin));
        localStorage.setItem("adminLoggedIn", "true");

        // Go to admin dashboard
        navigate("/admin");
      } else {
        setError(data.message || "Invalid admin email or password.");
      }
    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        "Unable to connect to the server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-icon">
          <FiShield />
        </div>

        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Sign in to access the SubtoUse administration panel.</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="admin-input-group">
            <label>Email Address</label>

            <div className="admin-input-wrapper">
              <FiMail className="admin-input-icon" />

              <input
                type="email"
                placeholder="admin@subtouse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label>Password</label>

            <div className="admin-input-wrapper">
              <FiLock className="admin-input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In
                <FiArrowRight />
              </>
            )}
          </button>

        </form>

        <div className="admin-login-footer">
          <FiShield />
          <span>Authorized administrators only</span>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;