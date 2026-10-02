import { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    referral: "",
    
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // FIXED: removed extra brackets
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    setLoading(true);
    setMessage("");
    try {
      const newFormData = new FormData();
      newFormData.append("username", formData.username);
      newFormData.append("email", formData.email);
      newFormData.append("phone", formData.phone);
      newFormData.append("password", formData.password);
      newFormData.append("referral", formData.referral);

      const response = await fetch("http://beamaxtechpractical.online/API/register.php", {
        method: "POST",
        body: newFormData,
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        if (data.status === 'success') {
          setMessage("successful");
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate("/dashboard");
        } else {
          setMessage(data.message);
        }
        console.log(data);
      } else {
        setMessage("failed");
        console.log(data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setMessage("an error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="register-screen">
      {/* ===== BACKGROUND ===== */}
      <div className="register-bg" aria-hidden="true">
        <div className="register-bg__gradient" />
        <div className="register-bg__orb register-bg__orb--one" />
        <div className="register-bg__orb register-bg__orb--two" />
        <div className="register-bg__orb register-bg__orb--three" />
        <div className="register-bg__mesh" />
        <div className="register-bg__glow" />

        {/* Floating decorative elements */}
        <div className="register-bg__float register-bg__float--card">
          <div className="float-card">
            <div className="float-card__chip" />
            <div className="float-card__number">•••• 4242</div>
            <div className="float-card__expiry">12/26</div>
          </div>
        </div>
        <div className="register-bg__float register-bg__float--shield">
          <div className="float-shield">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v6c0 5.5 9 9 9 9s9-3.5 9-9V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="register-bg__float register-bg__float--stats">
          <div className="float-stats">
            <span className="float-stats__number">$2.4B</span>
            <span className="float-stats__label">Processed</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN SHELL ===== */}
      <div className="register-shell">
        {/* LEFT – Brand Panel */}
        <aside className="register-brand">
          <div className="register-brand__top">
            <div className="brand-logo">
              <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" />
                <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="brand-logo__text">SubtoUse</span>
            </div>
            <div className="brand-status">
              <span className="brand-status__dot" />
              <span>Secure · 256-bit</span>
            </div>
          </div>

          <div className="register-brand__body">
            <span className="register-brand__badge">✦ Premium</span>
            <h1 className="register-brand__title">
              Create your <br />
              <span className="register-brand__highlight">SubtoUse</span> account
            </h1>
            <p className="register-brand__subtitle">
              Join thousands of businesses and individuals who trust SubtoUse
              for fast, secure, and reliable financial services.
            </p>

            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-item__icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L3 6.5V13c0 4 7 6.5 7 6.5s7-2.5 7-6.5V6.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M7.5 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="trust-item__content">
                  <p className="trust-item__title">Bank‑grade Security</p>
                  <p className="trust-item__desc">256‑bit encryption with PCI compliance</p>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-item__icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M3 10h3.5L8 7l2 6 1.5-4H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="trust-item__content">
                  <p className="trust-item__title">Instant Transactions</p>
                  <p className="trust-item__desc">Process payments in milliseconds</p>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-item__icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 5v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="trust-item__content">
                  <p className="trust-item__title">24/7 Support</p>
                  <p className="trust-item__desc">Dedicated team always available</p>
                </div>
              </div>
            </div>
          </div>

          <div className="register-brand__footer">
            <span>© 2024 SubtoUse Inc.</span>
            <span className="register-brand__divider">•</span>
            <span>All rights reserved</span>
          </div>
        </aside>

        {/* RIGHT – Registration Card */}
        <main className="register-panel">
          <div className="register-card">
            <div className="register-card__mobile-logo">
              <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" />
                <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>SubtoUse</span>
            </div>

            <div className="register-card__header">
              <h2 className="register-card__title">Get started</h2>
              <p className="register-card__subtitle">Create your account in seconds</p>
            </div>

            {message && (
              <div className={`register-card__message ${message === 'successful' ? 'register-card__message--success' : 'register-card__message--error'}`} role="alert">
                <svg viewBox="0 0 20 20" fill="none">
                  {message === 'successful' ? (
                    <path d="M6 10l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                  )}
                  {message !== 'successful' && <path d="M10 6v5M10 13v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                </svg>
                {message}
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-group__label" htmlFor="username">Username</label>
                <div className="form-group__input-wrapper">
                  <span className="form-group__icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 17c0-3 3.5-5 7-5s7 2 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-group__label" htmlFor="email">Email Address</label>
                <div className="form-group__input-wrapper">
                  <span className="form-group__icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3.5 5.5l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-group__label" htmlFor="phone">Phone Number</label>
                <div className="form-group__input-wrapper">
                  <span className="form-group__icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M6 2h8v2H6V2z" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="4" y="4" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="15" r="0.5" fill="currentColor" />
                    </svg>
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-group__label" htmlFor="password">Password</label>
                <div className="form-group__input-wrapper">
                  <span className="form-group__icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6.5 9V6.5a3.5 3.5 0 117 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-group__label" htmlFor="referral">
                  Referral Code <span className="form-group__optional">(optional)</span>
                </label>
                <div className="form-group__input-wrapper">
                  <span className="form-group__icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                  <input
                    id="referral"
                    name="referral"
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referral}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`btn-primary ${loading ? 'btn-primary--loading' : ''}`}
                disabled={loading}
              >
                <span className="btn-primary__label">
                  {loading ? 'Creating account...' : 'Create account'}
                </span>
                {loading && (
                  <span className="btn-primary__spinner" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <div className="register-card__footer">
              <span>Already have an account?</span>
              <a href="/login" className="register-card__link">Sign in</a>
            </div>

            <div className="register-card__legal">
              <span>By creating an account, you agree to our</span>
              <a href="/terms">Terms of Service</a>
              <span>and</span>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Register;