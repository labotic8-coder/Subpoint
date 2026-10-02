
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";

const LOGIN_URL =
  "http://beamaxtechpractical.online/API/login_test.php";
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("rememberedEmail") || "";
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(localStorage.getItem("rememberedEmail"));
  });

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  /*
  |--------------------------------------------------------------------------
  | VALIDATE LOGIN FORM
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    const newErrors = {};

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      newErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Enter your password.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (isLoading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | CREATE FORM DATA
      |--------------------------------------------------------------------------
      */

      const formData = new FormData();

      formData.append("email", email.trim());
      formData.append("password", password);

      console.log("=================================");
      console.log("LOGIN REQUEST STARTED");
      console.log("API URL:", LOGIN_URL);
      console.log("EMAIL:", email.trim());
      console.log("=================================");

      /*
      |--------------------------------------------------------------------------
      | SEND REQUEST
      |--------------------------------------------------------------------------
      */

      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      console.log("LOGIN HTTP STATUS:", response.status);
      console.log("LOGIN HTTP OK:", response.ok);

      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE SAFELY
      |--------------------------------------------------------------------------
      */

      const rawResponse = await response.text();

      console.log("RAW SERVER RESPONSE:");
      console.log(rawResponse);

      /*
      |--------------------------------------------------------------------------
      | EMPTY RESPONSE
      |--------------------------------------------------------------------------
      */

      if (!rawResponse.trim()) {
        throw new Error(
          "The server returned an empty response."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PARSE JSON
      |--------------------------------------------------------------------------
      */

      let data;

      try {
        data = JSON.parse(rawResponse);
      } catch (error) {
        console.error("JSON PARSE ERROR:", error);

        throw new Error(
          "The server returned an invalid response. Check the PHP API."
        );
      }

      console.log("LOGIN JSON RESPONSE:", data);

      /*
      |--------------------------------------------------------------------------
      | HANDLE API ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE TOKEN
      |--------------------------------------------------------------------------
      */

      if (
        !data.token ||
        typeof data.token !== "string"
      ) {
        throw new Error(
          "Login succeeded, but the server did not return an authentication token."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE AUTH TOKEN
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "authToken",
        data.token
      );

      /*
      |--------------------------------------------------------------------------
      | SAVE TOKEN EXPIRATION
      |--------------------------------------------------------------------------
      */

      if (data.expires_at) {
        localStorage.setItem(
          "apiTokenExpiresAt",
          data.expires_at
        );
      } else {
        localStorage.removeItem(
          "apiTokenExpiresAt"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE USER
      |--------------------------------------------------------------------------
      */

      if (data.user && typeof data.user === "object") {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      } else {
        localStorage.removeItem("user");
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE LOGIN STATE
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      /*
      |--------------------------------------------------------------------------
      | REMEMBER EMAIL
      |--------------------------------------------------------------------------
      */

      if (rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          email.trim()
        );
      } else {
        localStorage.removeItem(
          "rememberedEmail"
        );
      }

      console.log("=================================");
      console.log("LOGIN SUCCESSFUL");
      console.log(
        "AUTH TOKEN:",
        localStorage.getItem("authToken")
          ? "SAVED"
          : "NOT SAVED"
      );
      console.log(
        "USER:",
        localStorage.getItem("user")
          ? "SAVED"
          : "NOT SAVED"
      );
      console.log("=================================");

      /*
      |--------------------------------------------------------------------------
      | REDIRECT
      |--------------------------------------------------------------------------
      */

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error instanceof TypeError) {
        setMessage(
          "Unable to connect to the server. Please check your internet connection and API URL."
        );
      } else {
        setMessage(
          error.message ||
            "Unable to sign in. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EMAIL CHANGE
  |--------------------------------------------------------------------------
  */

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);
    setMessage("");

    if (errors.email) {
      setErrors((previous) => ({
        ...previous,
        email: "",
      }));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PASSWORD CHANGE
  |--------------------------------------------------------------------------
  */

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);
    setMessage("");

    if (errors.password) {
      setErrors((previous) => ({
        ...previous,
        password: "",
      }));
    }
  };

  return (
    <div className="auth-screen">

      <div
        className="auth-bg"
        aria-hidden="true"
      >
        <div className="auth-bg__grid" />
        <div className="auth-bg__blob auth-bg__blob--one" />
        <div className="auth-bg__blob auth-bg__blob--two" />
        <div className="auth-bg__blob auth-bg__blob--three" />
        <div className="auth-bg__glow" />
      </div>

      <div className="auth-shell">

        {/* LEFT */}

        <aside className="auth-brand">

          <div className="auth-brand__top">

            <div className="brand-mark">

              <span className="brand-mark__icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </span>

              <span className="brand-mark__text">
                SubtoUse
              </span>

            </div>

            <span className="brand-status">

              <span className="brand-status__dot" />

              All systems operational

            </span>

          </div>

          <div className="auth-brand__body">

            <p className="auth-brand__eyebrow">
              Welcome back
            </p>

            <h1 className="auth-brand__headline">

              Payments, airtime, and data —

              <br />

              handled at the speed of trust.

            </h1>

            <p className="auth-brand__sub">

              Sign in to manage transactions,
              send airtime, and top up data
              for yourself or your customers
              in seconds.

            </p>

            <ul className="trust-list">

              <li className="trust-item">

                <span className="trust-item__icon">
                  ✓
                </span>

                <div>

                  <p className="trust-item__title">
                    Secure transactions
                  </p>

                  <p className="trust-item__desc">
                    Secure processing on every transaction.
                  </p>

                </div>

              </li>

              <li className="trust-item">

                <span className="trust-item__icon">
                  ⚡
                </span>

                <div>

                  <p className="trust-item__title">
                    Instant airtime & data
                  </p>

                  <p className="trust-item__desc">
                    Top up your phone in seconds.
                  </p>

                </div>

              </li>

              <li className="trust-item">

                <span className="trust-item__icon">
                  ◷
                </span>

                <div>

                  <p className="trust-item__title">
                    24/7 reliable service
                  </p>

                  <p className="trust-item__desc">
                    Your account is available whenever you need it.
                  </p>

                </div>

              </li>

            </ul>

          </div>

          <p className="auth-brand__footer">

            © {new Date().getFullYear()} SubtoUse.

            All rights reserved.

          </p>

        </aside>

        {/* RIGHT */}

        <main className="auth-panel">

          <div className="auth-card">

            <div className="auth-card__logo auth-card__logo--mobile">

              <span className="brand-mark__icon brand-mark__icon--sm">
                ✓
              </span>

              <span className="brand-mark__text">
                SubtoUse
              </span>

            </div>

            <div className="auth-card__header">

              <h2 className="auth-card__title">
                Sign in to your account
              </h2>

              <p className="auth-card__subtitle">

                Enter your details to continue
                to your dashboard.

              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
              noValidate
            >

              {message && (

                <div
                  className="login-message"
                  role="alert"
                >
                  {message}
                </div>

              )}

              {/* EMAIL */}

              <div className="form-field">

                <label
                  className="form-field__label"
                  htmlFor="email"
                >
                  Email address
                </label>

                <div
                  className={`form-field__control ${
                    errors.email
                      ? "form-field__control--error"
                      : ""
                  }`}
                >

                  <span className="form-field__icon">
                    @
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.email && (

                  <p className="form-field__error">
                    {errors.email}
                  </p>

                )}

              </div>

              {/* PASSWORD */}

              <div className="form-field">

                <div className="form-field__label-row">

                  <label
                    className="form-field__label"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <a
                    className="form-field__link"
                    href="#forgot-password"
                  >
                    Forgot password?
                  </a>

                </div>

                <div
                  className={`form-field__control ${
                    errors.password
                      ? "form-field__control--error"
                      : ""
                  }`}
                >

                  <span className="form-field__icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="form-field__toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={isLoading}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                {errors.password && (

                  <p className="form-field__error">
                    {errors.password}
                  </p>

                )}

              </div>

              {/* REMEMBER ME */}

              <div className="form-row">

                <label className="checkbox">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                    disabled={isLoading}
                  />

                  <span className="checkbox__box">
                    ✓
                  </span>

                  <span className="checkbox__label">
                    Remember me
                  </span>

                </label>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className={`btn-primary ${
                  isLoading
                    ? "btn-primary--loading"
                    : ""
                }`}
                disabled={isLoading}
              >

                <span className="btn-primary__label">

                  {isLoading
                    ? "Signing in..."
                    : "Sign in"}

                </span>

                {isLoading && (
                  <span className="btn-primary__spinner" />
                )}

              </button>

              <div className="divider">
                <span>
                  or continue with
                </span>
              </div>

              <button
                type="button"
                className="btn-google"
                disabled
              >

                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  G
                </span>

                <span>
                  Sign in with Google
                </span>

              </button>

            </form>

            <p className="auth-card__footer">

              Don't have an account?{" "}

              <Link
                className="form-field__link form-field__link--strong"
                to="/register"
              >
                Create one for free
              </Link>

            </p>

          </div>

          <p className="auth-panel__legal">

            Your connection and account information
            are protected by secure authentication.

          </p>

        </main>

      </div>

    </div>
  );
}

