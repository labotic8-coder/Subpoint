
import { useState, useEffect, useRef, useCallback } from "react";
import "./Wallet.css";
import { usePaystackPayment } from "react-paystack";

/* ------------------------------------------------------------------ */
/* Inline icon set (no external icon library required)                 */
/* ------------------------------------------------------------------ */

const IconNaira = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M5 4v16M19 4v16M5 9h14M5 15h14M5 4l14 16M19 4L5 20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="5"
      y="11"
      width="14"
      height="9"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8 11V7a4 4 0 018 0v4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCard = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="2.5"
      y="5.5"
      width="19"
      height="13"
      rx="2.2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path d="M2.5 10h19" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const IconBank = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M3 10l9-6 9 6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M4 10v9M9 10v9M15 10v9M20 10v9M2.5 19h19"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const IconTransfer = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M4 8h13M17 8l-3.5-3.5M17 8l-3.5 3.5M20 16H7M7 16l3.5-3.5M7 16l3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconUssd = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="6"
      y="2.5"
      width="12"
      height="19"
      rx="2.2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M9 18h6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const IconQr = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h.01"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M12 7v5l3.5 2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconDownload = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const IconEye = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
);

const IconRepeat = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCoin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M12 7.5v9M9.5 9.3c0-1 1-1.8 2.5-1.8s2.5.7 2.5 1.6c0 2.2-5 1-5 3.2 0 .9 1 1.7 2.5 1.7s2.5-.8 2.5-1.8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatNaira = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG", {
    maximumFractionDigits: 0,
  })}`;

const QUICK_AMOUNTS = [
  500,
  1000,
  2000,
  5000,
  10000,
  20000,
  50000,
  100000,
];

/* ------------------------------------------------------------------ */
/* Wallet Component                                                    */
/* ------------------------------------------------------------------ */

export default function Wallet() {
  const savedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = savedUser ? JSON.parse(savedUser) : {};
  } catch (error) {
    console.error("Invalid user data:", error);
    user = {};
  }

  const [fundingHistory, setFundingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [balance, setBalance] = useState(Number(user.balance || 0));

  const targetBalance = Number(user.balance || 0);
  const availableBalance = balance;

  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomActive, setIsCustomActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState([]);

  const buttonRef = useRef(null);

  /* ---------------------------------------------------------------- */
  /* Fetch funding history                                             */
  /* ---------------------------------------------------------------- */

  const getFundingHistory = useCallback(async () => {
    if (!user.id) {
      setHistoryLoading(false);
      return;
    }

    console.log("Fetching funding history...");

    try {
      const response = await fetch(
        `http://beamaxtechpractical.online/API/get_funding_history.php?user_id=${user.id}`
      );

      const data = await response.json();

      console.log("Funding History:", data);

      if (data.success) {
        setFundingHistory(Array.isArray(data.history) ? data.history : []);
      } else {
        setFundingHistory([]);
      }
    } catch (error) {
      console.error("Funding history error:", error);
      setFundingHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user.id]);

  /* ---------------------------------------------------------------- */
  /* Balance count-up animation                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let frame;

    const duration = 1200;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setBalance(Math.floor(eased * targetBalance));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [targetBalance]);

  /* ---------------------------------------------------------------- */
  /* Load funding history                                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    getFundingHistory();
  }, [getFundingHistory]);

  /* ---------------------------------------------------------------- */
  /* Amount handlers                                                   */
  /* ---------------------------------------------------------------- */

  const handleQuickAmount = (amount) => {
    setSelectedAmount(amount);
    setIsCustomActive(false);
    setCustomAmount("");
  };

  const handleCustomChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");

    setCustomAmount(raw);
    setIsCustomActive(true);
    setSelectedAmount(null);
  };

  const activeAmount = isCustomActive
    ? Number(customAmount || 0)
    : selectedAmount;

  const isValidAmount = activeAmount >= 100;

  /* ---------------------------------------------------------------- */
  /* Paystack                                                          */
  /* ---------------------------------------------------------------- */

  const config = {
    reference: new Date().getTime().toString(),
    email: user.email,
    amount: activeAmount * 100,
    publicKey:
      "pk_test_42a7f8ca1e442f4f7985ca7d756397dcb81364d9",
  };

  const initializePayment = usePaystackPayment(config);

  /* ---------------------------------------------------------------- */
  /* Payment success                                                   */
  /* ---------------------------------------------------------------- */

  const onSuccess = async (reference) => {
    console.log("Payment Successful:", reference);

    try {
      const newFormData = new FormData();

      newFormData.append("user_id", user.id);
      newFormData.append("amount", activeAmount);

      const response = await fetch(
        "http://beamaxtechpractical.online/API/balance_update.php",
        {
          method: "POST",
          body: newFormData,
        }
      );

      const data = await response.json();

      console.log("Balance update response:", data);

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Payment was successful, but wallet update could not be completed."
        );
        return;
      }

      const updatedBalance =
        Number(user.balance || 0) + Number(activeAmount);

      user.balance = updatedBalance;

      localStorage.setItem("user", JSON.stringify(user));

      setBalance(updatedBalance);

      await getFundingHistory();

      alert("Payment Successful!");
    } catch (error) {
      console.error("Wallet update error:", error);

      alert(
        "Payment was successful, but we could not refresh your wallet balance. Please check your funding history."
      );
    }
  };

  /* ---------------------------------------------------------------- */
  /* Payment close                                                     */
  /* ---------------------------------------------------------------- */

  const onClose = () => {
    console.log("Payment window closed.");
    alert("Payment Cancelled");
  };

  /* ---------------------------------------------------------------- */
  /* Button ripple                                                     */
  /* ---------------------------------------------------------------- */

  const createRipple = (e) => {
    const btn = buttonRef.current;

    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);

    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const id = Date.now();

    setRipples((prev) => [
      ...prev,
      {
        id,
        x,
        y,
        size,
      },
    ]);

    setTimeout(() => {
      setRipples((prev) =>
        prev.filter((ripple) => ripple.id !== id)
      );
    }, 650);
  };

  /* ---------------------------------------------------------------- */
  /* Proceed to payment                                                */
  /* ---------------------------------------------------------------- */

  const handleProceed = useCallback(
    (e) => {
      if (!isValidAmount || loading) return;

      createRipple(e);

      setLoading(true);

      initializePayment({
        onSuccess,
        onClose,
      });

      setTimeout(() => {
        setLoading(false);
      }, 2200);
    },
    [
      isValidAmount,
      loading,
      initializePayment,
      onSuccess,
    ]
  );

  /* ---------------------------------------------------------------- */
  /* Funding statistics                                               */
  /* ---------------------------------------------------------------- */

  const today = new Date().toDateString();

  const todayFunding = fundingHistory
    .filter(
      (item) =>
        new Date(item.created_at).toDateString() === today &&
        String(item.status).toLowerCase() === "success"
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalDeposits = fundingHistory
    .filter(
      (item) =>
        String(item.status).toLowerCase() === "success"
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const successfulDeposits = fundingHistory.filter(
    (item) =>
      String(item.status).toLowerCase() === "success"
  ).length;

  const pendingDeposits = fundingHistory.filter(
    (item) =>
      String(item.status).toLowerCase() === "pending"
  ).length;

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="wallet-content">

      {/* ------------------------------------------------------------ */}
      {/* Page heading                                                   */}
      {/* ------------------------------------------------------------ */}

      <div className="wallet-page-head fade-in">
        <div>
          <p className="wallet-eyebrow">Wallet</p>

          <h1 className="wallet-title">
            Fund your SubtoUse wallet
          </h1>

          <p className="wallet-subtitle">
            Top up instantly and pay for airtime, data and bills
            without delay.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Balance Card                                                   */}
      {/* ------------------------------------------------------------ */}

      <section className="balance-card fade-in">
        <div
          className="balance-card-glow"
          aria-hidden="true"
        />

        <div
          className="balance-coins"
          aria-hidden="true"
        >
          <IconCoin className="coin coin-1" />
          <IconCoin className="coin coin-2" />
          <IconCoin className="coin coin-3" />
          <IconCoin className="coin coin-4" />
        </div>

        <div className="balance-card-inner">

          <div className="balance-main">
            <span className="balance-label">
              Current wallet balance
            </span>

            <span className="balance-amount">
              {formatNaira(balance)}
            </span>

            <span className="balance-tag">
              <IconShield className="tag-icon" />
              Secured &amp; verified
            </span>
          </div>

          <div className="balance-meta">

            <div className="meta-item">
              <span className="meta-label">
                Available balance
              </span>

              <span className="meta-value">
                {formatNaira(availableBalance)}
              </span>
            </div>

            <div
              className="meta-divider"
              aria-hidden="true"
            />

            <div className="meta-item">
              <span className="meta-label">
                Last funding date
              </span>

              <span className="meta-value meta-value--muted">
                <IconClock className="meta-icon" />
                Jul 09, 2026
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Funding + Payment grid                                        */}
      {/* ------------------------------------------------------------ */}

      <div className="funding-grid">

        {/* Funding column */}

        <section className="panel funding-panel fade-in">

          <h2 className="panel-title">
            Choose an amount
          </h2>

          <p className="panel-subtitle">
            Select a quick amount or enter a custom value.
          </p>

          <div className="quick-amounts">

            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`quick-amount-btn${
                  !isCustomActive &&
                  selectedAmount === amount
                    ? " is-selected"
                    : ""
                }`}
                onClick={() => handleQuickAmount(amount)}
              >
                {formatNaira(amount)}
              </button>
            ))}

          </div>

          <div className="custom-amount-wrap">

            <label
              className="custom-amount-label"
              htmlFor="customAmount"
            >
              Or enter a custom amount
            </label>

            <div
              className={`custom-amount-field${
                isCustomActive ? " is-focused" : ""
              }`}
            >
              <span className="currency-icon">
                <IconNaira />
              </span>

              <input
                id="customAmount"
                type="text"
                inputMode="numeric"
                placeholder="0.00"
                value={customAmount}
                onFocus={() => setIsCustomActive(true)}
                onChange={handleCustomChange}
              />
            </div>

            {isCustomActive &&
              customAmount !== "" &&
              !isValidAmount && (
                <span className="field-error">
                  Minimum funding amount is ₦100
                </span>
              )}

          </div>

          <div className="gateway-card">

            <div className="gateway-head">

              <span className="gateway-badge">
                Powered by Paystack
              </span>

              <div className="gateway-badges">
                <span className="mini-badge">
                  PCI DSS
                </span>

                <span className="mini-badge">
                  SSL Secure
                </span>

                <span className="mini-badge">
                  256-bit Encryption
                </span>
              </div>

            </div>

            <div className="gateway-methods">

              <div className="method-chip">
                <IconCard className="method-icon" />
                <span>Card</span>
              </div>

              <div className="method-chip">
                <IconBank className="method-icon" />
                <span>Bank</span>
              </div>

              <div className="method-chip">
                <IconTransfer className="method-icon" />
                <span>Transfer</span>
              </div>

              <div className="method-chip">
                <IconUssd className="method-icon" />
                <span>USSD</span>
              </div>

              <div className="method-chip">
                <IconQr className="method-icon" />
                <span>QR</span>
              </div>

            </div>
          </div>

          <button
            ref={buttonRef}
            type="button"
            className={`proceed-btn${
              loading ? " is-loading" : ""
            }`}
            disabled={!isValidAmount || loading}
            onClick={handleProceed}
          >

            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="ripple"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                }}
              />
            ))}

            <span className="proceed-btn-content">

              {loading ? (
                <>
                  <span className="spinner" />
                  Processing payment…
                </>
              ) : (
                <>
                  Proceed to pay{" "}
                  {isValidAmount
                    ? formatNaira(activeAmount)
                    : ""}
                </>
              )}

            </span>
          </button>

        </section>

        {/* Security column */}

        <section className="panel security-panel fade-in">

          <h2 className="panel-title">
            Why fund with SubtoUse
          </h2>

          <p className="panel-subtitle">
            Bank-grade protection on every transaction.
          </p>

          <ul className="security-list">

            <li className="security-item">
              <span className="security-icon">
                <IconLock />
              </span>

              <div>
                <span className="security-name">
                  SSL encryption
                </span>

                <span className="security-desc">
                  Every session is encrypted end to end.
                </span>
              </div>
            </li>

            <li className="security-item">
              <span className="security-icon">
                <IconShield />
              </span>

              <div>
                <span className="security-name">
                  Fraud detection
                </span>

                <span className="security-desc">
                  Transactions are screened in real time.
                </span>
              </div>
            </li>

            <li className="security-item">
              <span className="security-icon">
                <IconCard />
              </span>

              <div>
                <span className="security-name">
                  PCI DSS compliant
                </span>

                <span className="security-desc">
                  Card data is never stored on our servers.
                </span>
              </div>
            </li>

            <li className="security-item">
              <span className="security-icon">
                <IconClock />
              </span>

              <div>
                <span className="security-name">
                  24/7 support
                </span>

                <span className="security-desc">
                  Help is always one message away.
                </span>
              </div>
            </li>

            <li className="security-item">
              <span className="security-icon">
                <IconBolt />
              </span>

              <div>
                <span className="security-name">
                  Instant funding
                </span>

                <span className="security-desc">
                  Wallet updates within seconds of payment.
                </span>
              </div>
            </li>

            <li className="security-item">
              <span className="security-icon">
                <IconShield />
              </span>

              <div>
                <span className="security-name">
                  100% secure
                </span>

                <span className="security-desc">
                  Independently audited security infrastructure.
                </span>
              </div>
            </li>

          </ul>
        </section>

      </div>

      {/* ------------------------------------------------------------ */}
      {/* Summary Cards                                                  */}
      {/* ------------------------------------------------------------ */}

      <section className="summary-grid fade-in">

        <div className="summary-card">
          <span className="summary-label">
            Today's funding
          </span>

          <span className="summary-value">
            {formatNaira(todayFunding)}
          </span>

          <span className="summary-trend summary-trend--up">
            +12.4% vs yesterday
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Total deposits
          </span>

          <span className="summary-value">
            {formatNaira(totalDeposits)}
          </span>

          <span className="summary-trend">
            Lifetime
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Successful deposits
          </span>

          <span className="summary-value">
            {successfulDeposits}
          </span>

          <span className="summary-trend summary-trend--up">
            98.6% success rate
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Pending deposits
          </span>

          <span className="summary-value">
            {pendingDeposits}
          </span>

          <span className="summary-trend summary-trend--warning">
            Awaiting confirmation
          </span>
        </div>

      </section>

      {/* ------------------------------------------------------------ */}
      {/* Funding History                                                */}
      {/* ------------------------------------------------------------ */}

      <section className="panel history-panel fade-in">

        <div className="history-head">
          <div>
            <h2 className="panel-title">
              Funding history
            </h2>

            <p className="panel-subtitle">
              A record of every wallet top-up.
            </p>
          </div>
        </div>

        {/* Desktop table */}

        <div className="history-table-wrap desktop-only">

          <table className="history-table">

            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {historyLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-loading"
                  >
                    Loading funding history...
                  </td>
                </tr>
              ) : fundingHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-empty"
                  >
                    <div className="empty-state">

                      <IconCoin className="empty-icon" />

                      <h3>No Funding History</h3>

                      <p>
                        You haven't funded your wallet yet.
                        Your deposits will appear here.
                      </p>

                    </div>
                  </td>
                </tr>
              ) : (
                fundingHistory.map((row) => (
                  <tr key={row.id}>

                    <td>
                      <span
                        className="cell-ref"
                        title={row.reference}
                      >
                        {row.reference}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        row.created_at
                      ).toLocaleString("en-NG")}
                    </td>

                    <td className="cell-amount">
                      {formatNaira(row.amount)}
                    </td>

                    <td>
                      Paystack
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${String(
                          row.status
                        ).toLowerCase()}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">

                        <button
                          className="icon-action"
                          type="button"
                          aria-label="View transaction"
                        >
                          <IconEye />
                        </button>

                        <button
                          className="icon-action"
                          type="button"
                          aria-label="Download receipt"
                        >
                          <IconDownload />
                        </button>

                        <button
                          className="icon-action"
                          type="button"
                          aria-label="Repeat transaction"
                        >
                          <IconRepeat />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>

        </div>

        {/* Mobile cards */}

        <div className="history-cards mobile-only">

          {historyLoading ? (
            <div className="history-card">

              <p style={{ textAlign: "center" }}>
                Loading funding history...
              </p>

            </div>
          ) : fundingHistory.length === 0 ? (
            <div className="history-card empty-history-card">

              <IconCoin className="empty-icon" />

              <h3>No Funding History</h3>

              <p>
                Your wallet funding transactions will
                appear here.
              </p>

            </div>
          ) : (
            fundingHistory.map((row) => (
              <div
                className="history-card"
                key={row.id}
              >

                <div className="history-card-top">

                  <span className="cell-ref">
                    {row.reference}
                  </span>

                  <span
                    className={`status-badge status-${String(
                      row.status
                    ).toLowerCase()}`}
                  >
                    {row.status}
                  </span>

                </div>

                <div className="history-card-amount">
                  {formatNaira(row.amount)}
                </div>

                <div className="history-card-meta">

                  <span>
                    {new Date(
                      row.created_at
                    ).toLocaleString("en-NG")}
                  </span>

                  <span>
                    Paystack
                  </span>

                </div>

                <div className="history-card-actions">

                  <button
                    className="pill-action"
                    type="button"
                  >
                    <IconEye />
                    View
                  </button>

                  <button
                    className="pill-action"
                    type="button"
                  >
                    <IconDownload />
                    Receipt
                  </button>

                  <button
                    className="pill-action"
                    type="button"
                  >
                    <IconRepeat />
                    Repeat
                  </button>

                </div>

              </div>
            ))
          )}

        </div>

      </section>

    </div>
  );
}

