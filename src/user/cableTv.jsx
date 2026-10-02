import React, { useMemo, useState, useEffect, useRef } from "react";
import "./CableTv.css";

/* ------------------------------------------------------------------
 * CableTv.jsx
 * Cable TV subscription page — drop into the existing dashboard layout.
 * No Header / Sidebar / layout markup here — this is page content only.
 *
 * API INTEGRATION POINTS (search these markers when wiring up real logic):
 *   - TODO:API  fetch providers/packages
 *   - TODO:API  verify smartcard/IUC number -> customer name
 *   - TODO:API  submit payment / subscription
 * ------------------------------------------------------------------ */

/* ---------------------------- Static data --------------------------- */
/* Replace with a real API call (TODO:API) — shape kept API-friendly. */
const PROVIDERS = [
  {
    id: "dstv",
    name: "DStv",
    tagline: "Sport, movies & more",
    initials: "DS",
    color: "#0057A3",
    packages: [
      { id: "dstv-padi", name: "Padi", price: 4400, desc: "Entry-level family bouquet" },
      { id: "dstv-yanga", name: "Yanga", price: 6000, desc: "Local & entertainment channels" },
      { id: "dstv-confam", name: "Confam", price: 11000, desc: "More sport & entertainment" },
      { id: "dstv-compact", name: "Compact", price: 19000, desc: "Most popular family bundle" },
      { id: "dstv-compact-plus", name: "Compact Plus", price: 30000, desc: "Extra sport & movie channels" },
      { id: "dstv-premium", name: "Premium", price: 44500, desc: "The full DStv experience" },
    ],
  },
  {
    id: "gotv",
    name: "GOtv",
    tagline: "Affordable home entertainment",
    initials: "GO",
    color: "#00A651",
    packages: [
      { id: "gotv-smallie", name: "Smallie", price: 1900, desc: "Basic entry bouquet" },
      { id: "gotv-jinja", name: "Jinja", price: 3900, desc: "Great value channel mix" },
      { id: "gotv-jolli", name: "Jolli", price: 5800, desc: "More entertainment & kids" },
      { id: "gotv-max", name: "Max", price: 8500, desc: "Sport & premium local content" },
      { id: "gotv-supa", name: "Supa", price: 11400, desc: "GOtv's top-tier bouquet" },
    ],
  },
  {
    id: "startimes",
    name: "StarTimes",
    tagline: "Great value, wide reach",
    initials: "ST",
    color: "#E11B22",
    packages: [
      { id: "st-nova", name: "Nova", price: 1700, desc: "Basic free-to-air plus" },
      { id: "st-basic", name: "Basic", price: 3700, desc: "Everyday entertainment" },
      { id: "st-smart", name: "Smart", price: 4700, desc: "Smart bouquet for HD decoders" },
      { id: "st-classic", name: "Classic", price: 5200, desc: "Popular all-round bouquet" },
      { id: "st-super", name: "Super", price: 9800, desc: "Top StarTimes bouquet" },
    ],
  },
];

const DURATIONS = [
  { id: "1m", label: "1 Month", months: 1, discount: 0 },
  { id: "2m", label: "2 Months", months: 2, discount: 0 },
  { id: "3m", label: "3 Months", months: 3, discount: 0.05 },
  { id: "6m", label: "6 Months", months: 6, discount: 0.08 },
  { id: "12m", label: "12 Months", months: 12, discount: 0.12 },
];

/* Mock recent/saved subscriptions — TODO:API replace with real history */
const RECENT_SUBSCRIPTIONS = [
  { providerId: "dstv", packageId: "dstv-compact", smartcard: "7041882910", label: "Home decoder" },
  { providerId: "gotv", packageId: "gotv-jolli", smartcard: "5029113847", label: "Room 2" },
];

const naira = (n) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/* ------------------------------ Icons -------------------------------- */
const CheckIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16" {...props}>
    <path
      d="M4 10.5l3.5 3.5L16 5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpinnerIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="ctv-spin" {...props}>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const AlertIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16" {...props}>
    <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="13.4" r="0.9" fill="currentColor" />
  </svg>
);

const ChevronDown = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16" {...props}>
    <path
      d="M5 7.5l5 5 5-5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* --------------------------- Small components ------------------------ */

function ProviderCard({ provider, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`ctv-provider-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(provider)}
      aria-pressed={selected}
    >
      <span
        className="ctv-provider-badge"
        style={{ background: `${provider.color}1a`, color: provider.color }}
      >
        {provider.initials}
      </span>
      <span className="ctv-provider-meta">
        <span className="ctv-provider-name">{provider.name}</span>
        <span className="ctv-provider-tagline">{provider.tagline}</span>
      </span>
      {selected && (
        <span className="ctv-provider-check">
          <CheckIcon />
        </span>
      )}
    </button>
  );
}

function PackageCard({ pkg, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`ctv-package-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(pkg)}
      aria-pressed={selected}
    >
      <div className="ctv-package-top">
        <span className="ctv-package-name">{pkg.name}</span>
        {selected && (
          <span className="ctv-package-check">
            <CheckIcon />
          </span>
        )}
      </div>
      <p className="ctv-package-desc">{pkg.desc}</p>
      <div className="ctv-package-price">{naira(pkg.price)}<span>/mo</span></div>
    </button>
  );
}

/* ------------------------------ Main page ----------------------------- */

export default function CableTv() {
  const [provider, setProvider] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [durationOpen, setDurationOpen] = useState(false);
  const durationRef = useRef(null);

  const [smartcard, setSmartcard] = useState("");
  const [smartcardTouched, setSmartcardTouched] = useState(false);

  const [verifyState, setVerifyState] = useState("idle"); // idle | verifying | success | error
  const [customerName, setCustomerName] = useState("");

  const [payState, setPayState] = useState("idle"); // idle | loading | success | error
  const [payError, setPayError] = useState("");

  /* Close duration dropdown on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (durationRef.current && !durationRef.current.contains(e.target)) {
        setDurationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Reset package when provider changes */
  useEffect(() => {
    setPkg(null);
  }, [provider]);

  /* Reset verification whenever the smartcard number changes */
  useEffect(() => {
    setVerifyState("idle");
    setCustomerName("");
  }, [smartcard]);

  const smartcardError = useMemo(() => {
    if (!smartcardTouched) return "";
    if (!smartcard.trim()) return "Enter your decoder / IUC / smartcard number.";
    if (!/^\d{10,11}$/.test(smartcard.trim())) {
      return "Number should be 10–11 digits.";
    }
    return "";
  }, [smartcard, smartcardTouched]);

  const isSmartcardValid = /^\d{10,11}$/.test(smartcard.trim());

  const amount = useMemo(() => {
    if (!pkg) return 0;
    const raw = pkg.price * duration.months;
    return Math.round(raw * (1 - duration.discount));
  }, [pkg, duration]);

  const savings = useMemo(() => {
    if (!pkg) return 0;
    return Math.round(pkg.price * duration.months * duration.discount);
  }, [pkg, duration]);

  const canPay =
    provider && pkg && isSmartcardValid && verifyState === "success" && payState !== "loading";

  /* ---- Handlers ---- */

  function handleVerify() {
    if (!isSmartcardValid) {
      setSmartcardTouched(true);
      return;
    }
    setVerifyState("verifying");
    // TODO:API — replace with real decoder/IUC verification call
    setTimeout(() => {
      const ok = smartcard.trim() !== "0000000000"; // demo-only failure case
      if (ok) {
        setVerifyState("success");
        setCustomerName("Verified Customer"); // TODO:API — use name returned by provider
      } else {
        setVerifyState("error");
        setCustomerName("");
      }
    }, 1100);
  }

  function handleSelectRecent(entry) {
    const p = PROVIDERS.find((x) => x.id === entry.providerId);
    if (!p) return;
    setProvider(p);
    const pack = p.packages.find((x) => x.id === entry.packageId);
    setPkg(pack || null);
    setSmartcard(entry.smartcard);
    setSmartcardTouched(true);
    setVerifyState("idle");
    setPayState("idle");
  }

  function handlePay() {
    if (!canPay) return;
    setPayState("loading");
    setPayError("");
    // TODO:API — replace with real payment/subscription submission
    setTimeout(() => {
      const success = Math.random() > 0.08; // demo-only occasional failure
      if (success) {
        setPayState("success");
      } else {
        setPayState("error");
        setPayError("We couldn't complete this payment. Please try again.");
      }
    }, 1400);
  }

  function handleReset() {
    setProvider(null);
    setPkg(null);
    setDuration(DURATIONS[0]);
    setSmartcard("");
    setSmartcardTouched(false);
    setVerifyState("idle");
    setCustomerName("");
    setPayState("idle");
    setPayError("");
  }

  /* ---- Success state renders a confirmation screen ---- */
  if (payState === "success") {
    return (
      <div className="ctv-page">
        <div className="ctv-success-wrap">
          <div className="ctv-success-card">
            <div className="ctv-success-icon">
              <CheckIcon width={28} height={28} />
            </div>
            <h2>Subscription successful</h2>
            <p>
              {provider?.name} <strong>{pkg?.name}</strong> has been activated on decoder{" "}
              <strong>{smartcard}</strong> for {duration.label.toLowerCase()}.
            </p>
            <div className="ctv-success-summary">
              <div>
                <span>Provider</span>
                <strong>{provider?.name}</strong>
              </div>
              <div>
                <span>Package</span>
                <strong>{pkg?.name}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{duration.label}</strong>
              </div>
              <div>
                <span>Amount paid</span>
                <strong>{naira(amount)}</strong>
              </div>
            </div>
            <div className="ctv-success-actions">
              <button className="ctv-btn ctv-btn-ghost" onClick={handleReset}>
                Make another subscription
              </button>
              <button className="ctv-btn ctv-btn-primary">View receipt</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ctv-page">
      {/* ---------- Heading ---------- */}
      <div className="ctv-heading">
        <h1>Cable TV Subscription</h1>
        <p>Renew or subscribe to DStv, GOtv, and StarTimes in a few seconds — no queues, no delays.</p>
      </div>

      <div className="ctv-layout">
        {/* ---------- Main column ---------- */}
        <div className="ctv-main">
          {/* Provider selection */}
          <section className="ctv-card">
            <div className="ctv-card-head">
              <h2>1. Choose a provider</h2>
            </div>
            <div className="ctv-provider-grid">
              {PROVIDERS.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  selected={provider?.id === p.id}
                  onSelect={setProvider}
                />
              ))}
            </div>
          </section>

          {/* Package selection */}
          <section className={`ctv-card${!provider ? " is-disabled" : ""}`}>
            <div className="ctv-card-head">
              <h2>2. Select a package</h2>
              {provider && <span className="ctv-card-hint">{provider.name} bouquets</span>}
            </div>

            {!provider ? (
              <div className="ctv-empty">
                <p>Pick a provider above to see available packages.</p>
              </div>
            ) : (
              <div className="ctv-package-grid">
                {provider.packages.map((p) => (
                  <PackageCard
                    key={p.id}
                    pkg={p}
                    selected={pkg?.id === p.id}
                    onSelect={setPkg}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Duration + Smartcard */}
          <section className={`ctv-card${!pkg ? " is-disabled" : ""}`}>
            <div className="ctv-card-head">
              <h2>3. Duration &amp; decoder details</h2>
            </div>

            <div className="ctv-form-grid">
              {/* Duration dropdown */}
              <div className="ctv-field">
                <label htmlFor="ctv-duration">Subscription duration</label>
                <div className="ctv-select" ref={durationRef}>
                  <button
                    type="button"
                    id="ctv-duration"
                    className="ctv-select-trigger"
                    onClick={() => setDurationOpen((v) => !v)}
                    disabled={!pkg}
                    aria-expanded={durationOpen}
                  >
                    <span>
                      {duration.label}
                      {duration.discount > 0 && (
                        <span className="ctv-select-badge">Save {duration.discount * 100}%</span>
                      )}
                    </span>
                    <ChevronDown className={durationOpen ? "ctv-rotate" : ""} />
                  </button>
                  {durationOpen && (
                    <div className="ctv-select-menu" role="listbox">
                      {DURATIONS.map((d) => (
                        <button
                          type="button"
                          key={d.id}
                          className={`ctv-select-option${
                            duration.id === d.id ? " is-selected" : ""
                          }`}
                          onClick={() => {
                            setDuration(d);
                            setDurationOpen(false);
                          }}
                          role="option"
                          aria-selected={duration.id === d.id}
                        >
                          <span>{d.label}</span>
                          {d.discount > 0 && (
                            <span className="ctv-select-badge">Save {d.discount * 100}%</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Smartcard input */}
              <div className="ctv-field">
                <label htmlFor="ctv-smartcard">Decoder / IUC / Smartcard number</label>
                <div className="ctv-input-row">
                  <input
                    id="ctv-smartcard"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 7041882910"
                    value={smartcard}
                    disabled={!pkg}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^\d]/g, "");
                      setSmartcard(digitsOnly);
                    }}
                    onBlur={() => setSmartcardTouched(true)}
                    className={`ctv-input${
                      smartcardError ? " has-error" : verifyState === "success" ? " has-success" : ""
                    }`}
                    maxLength={11}
                  />
                  <button
                    type="button"
                    className="ctv-btn ctv-btn-secondary ctv-verify-btn"
                    onClick={handleVerify}
                    disabled={!pkg || !isSmartcardValid || verifyState === "verifying"}
                  >
                    {verifyState === "verifying" ? <SpinnerIcon /> : "Verify"}
                  </button>
                </div>

                {smartcardError && (
                  <p className="ctv-field-message is-error">
                    <AlertIcon /> {smartcardError}
                  </p>
                )}
                {!smartcardError && verifyState === "success" && (
                  <p className="ctv-field-message is-success">
                    <CheckIcon /> Verified — {customerName}
                  </p>
                )}
                {!smartcardError && verifyState === "error" && (
                  <p className="ctv-field-message is-error">
                    <AlertIcon /> Couldn't verify this number. Check it and try again.
                  </p>
                )}
                {!smartcardError && verifyState === "idle" && pkg && (
                  <p className="ctv-field-message is-neutral">
                    We'll verify this number before you pay.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Recent subscriptions */}
          {RECENT_SUBSCRIPTIONS.length > 0 && (
            <section className="ctv-card ctv-recent">
              <div className="ctv-card-head">
                <h2>Recent subscriptions</h2>
              </div>
              <div className="ctv-recent-list">
                {RECENT_SUBSCRIPTIONS.map((entry, idx) => {
                  const p = PROVIDERS.find((x) => x.id === entry.providerId);
                  const pk = p?.packages.find((x) => x.id === entry.packageId);
                  if (!p || !pk) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="ctv-recent-item"
                      onClick={() => handleSelectRecent(entry)}
                    >
                      <span
                        className="ctv-provider-badge sm"
                        style={{ background: `${p.color}1a`, color: p.color }}
                      >
                        {p.initials}
                      </span>
                      <span className="ctv-recent-meta">
                        <span className="ctv-recent-title">
                          {p.name} · {pk.name}
                        </span>
                        <span className="ctv-recent-sub">
                          {entry.label} · {entry.smartcard}
                        </span>
                      </span>
                      <span className="ctv-recent-cta">Use again</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ---------- Summary sidebar ---------- */}
        <aside className="ctv-summary">
          <div className="ctv-card ctv-summary-card">
            <div className="ctv-card-head">
              <h2>Order summary</h2>
            </div>

            {!provider ? (
              <div className="ctv-empty">
                <p>Your subscription summary will appear here once you choose a provider.</p>
              </div>
            ) : (
              <>
                <div className="ctv-summary-rows">
                  <div className="ctv-summary-row">
                    <span>Provider</span>
                    <strong>{provider.name}</strong>
                  </div>
                  <div className="ctv-summary-row">
                    <span>Package</span>
                    <strong>{pkg ? pkg.name : "—"}</strong>
                  </div>
                  <div className="ctv-summary-row">
                    <span>Duration</span>
                    <strong>{duration.label}</strong>
                  </div>
                  <div className="ctv-summary-row">
                    <span>Decoder number</span>
                    <strong>{smartcard || "—"}</strong>
                  </div>
                  {savings > 0 && (
                    <div className="ctv-summary-row ctv-summary-savings">
                      <span>You save</span>
                      <strong>{naira(savings)}</strong>
                    </div>
                  )}
                </div>

                <div className="ctv-summary-total">
                  <span>Total amount</span>
                  <strong>{naira(amount)}</strong>
                </div>

                {payState === "error" && (
                  <p className="ctv-field-message is-error ctv-pay-error">
                    <AlertIcon /> {payError}
                  </p>
                )}

                <button
                  type="button"
                  className="ctv-btn ctv-btn-primary ctv-pay-btn"
                  disabled={!canPay}
                  onClick={handlePay}
                >
                  {payState === "loading" ? (
                    <>
                      <SpinnerIcon /> Processing payment…
                    </>
                  ) : (
                    <>Pay Now · {pkg ? naira(amount) : "—"}</>
                  )}
                </button>

                <p className="ctv-summary-note">
                  {verifyState === "success"
                    ? "Decoder verified. You're ready to pay."
                    : "Verify your decoder number to enable payment."}
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}