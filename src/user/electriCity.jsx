

import React, { useState } from "react";
import "./Electricity.css";

/* ------------------------------------------------------------------ */
/* Static reference data (safe to move to a config file later)         */
/* ------------------------------------------------------------------ */

const PROVIDERS = [
  { code: "EEDC", name: "Enugu Electricity Distribution Company" },
  { code: "EKEDC", name: "Eko Electricity Distribution Company" },
  { code: "IKEDC", name: "Ikeja Electric" },
  { code: "AEDC", name: "Abuja Electricity Distribution Company" },
  { code: "IBEDC", name: "Ibadan Electricity Distribution Company" },
  { code: "PHED", name: "Port Harcourt Electricity Distribution" },
  { code: "YEDC", name: "Yola Electricity Distribution Company" },
  { code: "KAEDCO", name: "Kaduna Electric" },
  { code: "KEDCO", name: "Kano Electricity Distribution Company" },
  { code: "JED", name: "Jos Electricity Distribution Company" },
  { code: "BEDC", name: "Benin Electricity Distribution Company" },
];

// Example past transactions — placeholder only, wire up to /api/transactions later
const RECENT_PAYMENTS = [
  {
    id: "TXN-88213",
    provider: "IKEDC",
    meterNumber: "04512278931",
    amount: 5000,
    date: "24 Jul, 2026",
    status: "success",
  },
  {
    id: "TXN-88147",
    provider: "EKEDC",
    meterNumber: "01029873645",
    amount: 10000,
    date: "19 Jul, 2026",
    status: "success",
  },
  {
    id: "TXN-88052",
    provider: "AEDC",
    meterNumber: "07766554321",
    amount: 3000,
    date: "12 Jul, 2026",
    status: "failed",
  },
];

/* ------------------------------------------------------------------ */
/* Small inline icon set — no external icon library required           */
/* ------------------------------------------------------------------ */

const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
      fill="currentColor"
    />
  </svg>
);

const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M12 2.5 4.5 5.5v6c0 5 3.2 8.6 7.5 10 4.3-1.4 7.5-5 7.5-10v-6L12 2.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="m9 12 2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconMeter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M12 13 15 9M12 4v2M5 6l1.5 1.5M19 6l-1.5 1.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const IconWallet = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16.5" cy="14" r="1.4" fill="currentColor" />
  </svg>
);

const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="m5 12.5 4.5 4.5L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M12 3 22 20H2L12 3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M12 9.5v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

const IconArrow = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M4 12h15M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconInbox = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M4 13V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6M4 13l3 5h10l3-5M4 13h4.5l1 2h5l1-2H20"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSpinner = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="42"
      strokeDashoffset="14"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatNaira = (value) => {
  const number = Number(value);
  if (!value || Number.isNaN(number)) return "";
  return number.toLocaleString("en-NG");
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function Electricity() {
  const [provider, setProvider] = useState("");
  const [meterType, setMeterType] = useState("prepaid");
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [customer, setCustomer] = useState(null); // { name } once verified

  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const resetVerification = () => {
    setCustomer(null);
    setVerifyError("");
    setPayError("");
  };

  const validateMeterStep = () => {
    const next = {};
    if (!provider) next.provider = "Select an electricity provider";
    if (!meterNumber.trim()) next.meterNumber = "Enter your meter number";
    else if (!/^\d{8,13}$/.test(meterNumber.trim()))
      next.meterNumber = "Enter a valid meter number (8–13 digits)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleVerifyMeter = async (e) => {
    e.preventDefault();
    resetVerification();
    if (!validateMeterStep()) return;

    setIsVerifying(true);
    try {
      // TODO: replace with real backend call, e.g.
      // const res = await fetch("/api/electricity/verify", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ provider, meterType, meterNumber }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || "Verification failed");
      // setCustomer({ name: data.customerName });

      await new Promise((resolve) => setTimeout(resolve, 1200));
      throw new Error(
        "Meter verification service is not connected yet. Please try again once billing is live."
      );
    } catch (err) {
      setVerifyError(err.message || "We couldn't verify this meter. Please check the details and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const validateAmount = () => {
    const next = { ...errors };
    delete next.amount;
    const numeric = Number(amount);
    if (!amount || numeric <= 0) next.amount = "Enter a valid amount";
    else if (numeric < 500) next.amount = "Minimum amount is ₦500";
    setErrors(next);
    return !next.amount;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPayError("");
    if (!validateAmount()) return;

    setIsPaying(true);
    try {
      // TODO: replace with real backend call, e.g.
      // const res = await fetch("/api/electricity/pay", { ... });
      // if (!res.ok) throw new Error("Payment failed");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      throw new Error("Payment gateway is not connected yet. No funds were deducted.");
    } catch (err) {
      setPayError(err.message || "Something went wrong while processing your payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleMeterNumberChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^\d]/g, "");
    setMeterNumber(digitsOnly);
    if (customer) resetVerification();
  };

  const handleProviderChange = (e) => {
    setProvider(e.target.value);
    if (customer) resetVerification();
  };

  const handleMeterTypeChange = (value) => {
    setMeterType(value);
    if (customer) resetVerification();
  };

  return (
    <div className="electricity-page">
      {/* Header */}
      <header className="electricity-header">
        <span className="electricity-header-icon">
          <IconBolt />
        </span>
        <div>
          <h1 className="electricity-title">Electricity Bill Payment</h1>
          <p className="electricity-subtitle">
            Pay your electricity bill quickly and securely.
          </p>
        </div>
      </header>

      <div className="electricity-layout">
        {/* Payment card */}
        <section className="electricity-card" aria-label="Electricity payment form">
          <form onSubmit={customer ? handlePay : handleVerifyMeter} noValidate>
            <div className="form-field">
              <label htmlFor="provider">Select Electricity Provider</label>
              <select
                id="provider"
                value={provider}
                onChange={handleProviderChange}
                className={errors.provider ? "input-error" : ""}
                aria-invalid={Boolean(errors.provider)}
                aria-describedby={errors.provider ? "provider-error" : undefined}
              >
                <option value="">Choose a provider</option>
                <option value="EEDC">EEDC — Enugu Electricity Distribution Company</option>
                <option value="EKEDC">EKEDC — Eko Electricity Distribution Company</option>
                <option value="IKEDC">IKEDC — Ikeja Electric</option>
                <option value="AEDC">AEDC — Abuja Electricity Distribution Company</option>
                <option value="IBEDC">IBEDC — Ibadan Electricity Distribution Company</option>
                <option value="PHED">PHED — Port Harcourt Electricity Distribution</option>
                <option value="YEDC">YEDC — Yola Electricity Distribution Company</option>
                <option value="KAEDCO">KAEDCO — Kaduna Electric</option>
                <option value="KEDCO">KEDCO — Kano Electricity Distribution Company</option>
                <option value="JED">JED — Jos Electricity Distribution Company</option>
                <option value="BEDC">BEDC — Benin Electricity Distribution Company</option>
              </select>
              {errors.provider && (
                <p className="field-error" id="provider-error">{errors.provider}</p>
              )}
            </div>

            <div className="form-field">
              <span className="field-label-static">Meter Type</span>
              <div className="meter-type-toggle" role="radiogroup" aria-label="Meter type">
                <button
                  type="button"
                  role="radio"
                  aria-checked={meterType === "prepaid"}
                  className={meterType === "prepaid" ? "toggle-option active" : "toggle-option"}
                  onClick={() => handleMeterTypeChange("prepaid")}
                >
                  Prepaid
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={meterType === "postpaid"}
                  className={meterType === "postpaid" ? "toggle-option active" : "toggle-option"}
                  onClick={() => handleMeterTypeChange("postpaid")}
                >
                  Postpaid
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="meterNumber">Meter Number</label>
              <div className={`input-with-icon ${errors.meterNumber ? "input-error" : ""}`}>
                <IconMeter className="input-icon" />
                <input
                  id="meterNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 04512278931"
                  value={meterNumber}
                  onChange={handleMeterNumberChange}
                  maxLength={13}
                  aria-invalid={Boolean(errors.meterNumber)}
                  aria-describedby={errors.meterNumber ? "meter-error" : undefined}
                />
              </div>
              {errors.meterNumber && (
                <p className="field-error" id="meter-error">{errors.meterNumber}</p>
              )}
            </div>

            {/* Verify action, or verified confirmation */}
            {!customer ? (
              <>
                {verifyError && (
                  <div className="inline-alert error" role="alert">
                    <IconAlert />
                    <span>{verifyError}</span>
                  </div>
                )}
                <button type="submit" className="btn-primary" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <IconSpinner className="spin" />
                      Verifying meter…
                    </>
                  ) : (
                    <>
                      Verify Meter
                      <IconArrow />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="inline-alert success" role="status">
                  <IconCheck />
                  <span>
                    Meter verified for <strong>{customer.name}</strong>
                  </span>
                </div>

                <div className="form-field">
                  <label htmlFor="amount">Amount</label>
                  <div className={`input-with-icon amount-input ${errors.amount ? "input-error" : ""}`}>
                    <span className="currency-prefix">₦</span>
                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="1,000"
                      value={formatNaira(amount)}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/[^\d]/g, "");
                        setAmount(digitsOnly);
                      }}
                      aria-invalid={Boolean(errors.amount)}
                      aria-describedby={errors.amount ? "amount-error" : undefined}
                    />
                  </div>
                  {errors.amount && (
                    <p className="field-error" id="amount-error">{errors.amount}</p>
                  )}
                </div>

                {payError && (
                  <div className="inline-alert error" role="alert">
                    <IconAlert />
                    <span>{payError}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={isPaying}>
                  {isPaying ? (
                    <>
                      <IconSpinner className="spin" />
                      Processing payment…
                    </>
                  ) : (
                    <>Pay {amount ? `₦${formatNaira(amount)}` : "Now"}</>
                  )}
                </button>
              </>
            )}

            <p className="secure-indicator">
              <IconShield />
              Secure &amp; fast payment
            </p>
          </form>
        </section>

        {/* How it works */}
        <section className="how-it-works" aria-label="How electricity payment works">
          <h2>How it works</h2>
          <ol className="steps-list">
            <li className="step">
              <span className="step-icon"><IconMeter /></span>
              <div>
                <p className="step-title">Select Provider</p>
                <p className="step-desc">Choose your electricity distribution company.</p>
              </div>
            </li>
            <li className="step">
              <span className="step-icon"><IconCheck /></span>
              <div>
                <p className="step-title">Verify Meter</p>
                <p className="step-desc">We confirm your meter number instantly.</p>
              </div>
            </li>
            <li className="step">
              <span className="step-icon"><IconWallet /></span>
              <div>
                <p className="step-title">Enter Amount</p>
                <p className="step-desc">Type in how much you'd like to pay.</p>
              </div>
            </li>
            <li className="step">
              <span className="step-icon"><IconBolt /></span>
              <div>
                <p className="step-title">Pay</p>
                <p className="step-desc">Complete payment and get your token.</p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      {/* Recent payments */}
      <section className="recent-payments" aria-label="Recent electricity payments">
        <h2>Recent Electricity Payments</h2>

        {RECENT_PAYMENTS.length === 0 ? (
          <div className="empty-state">
            <IconInbox />
            <p>No electricity payments yet</p>
            <span>Your recent transactions will show up here once you make a payment.</span>
          </div>
        ) : (
          <div className="transactions-list">
            {RECENT_PAYMENTS.map((txn) => (
              <div className="transaction-card" key={txn.id}>
                <span className="transaction-icon">
                  <IconBolt />
                </span>
                <div className="transaction-main">
                  <p className="transaction-provider">
                    {txn.provider} <span className="transaction-meter">• {txn.meterNumber}</span>
                  </p>
                  <p className="transaction-date">{txn.date}</p>
                </div>
                <div className="transaction-meta">
                  <p className="transaction-amount">₦{formatNaira(txn.amount)}</p>
                  <span className={`status-pill ${txn.status}`}>
                    {txn.status === "success" ? "Successful" : "Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Electricity;