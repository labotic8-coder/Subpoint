
import { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// import Sidebar from "./sidebar";
// import Header from "./Header";

function Dashboard() {

  /* ==============================
     SIDEBAR STATE
  ============================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);


  /* ==============================
     USER DATA
  ============================== */

  const navigate = useNavigate();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const [analytics, setAnalytics] = useState({
    total_transactions: 0,
    successful: 0,
    airtime_purchased: 0,
    data_purchased: 0,
    wallet_funding: 0,
    referral_earnings: 0
  });


  /* ==============================
     RECENT TRANSACTIONS
  ============================== */

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);


  /* ==============================
     SAVED USER
  ============================== */

  const savedUser = localStorage.getItem("user");

  let user = {};

  try {

    user = savedUser ? JSON.parse(savedUser) : {};

  } catch (error) {

    console.error("Invalid user data:", error);

    user = {};

  }
const [balance, setBalance] = useState(
  Number(user?.balance || 0)
);

  /* ==============================
     LOAD DASHBOARD ANALYTICS
  ============================== */

  useEffect(() => {

    if (!user?.id) {
      return;
    }

    fetch(
      `http://beamaxtechpractical.online/API/dashboard_stats.php?user_id=${user.id}`
    ).then(result => {
  if (result.success) {
    setAnalytics(result.data);

    setBalance(Number(result.data.balance || 0));
  }
})
      .catch(error => {

        console.error(
          "Failed to load dashboard analytics:",
          error
        );

      });

  }, [user?.id]);


  /* ==============================
     LOAD RECENT TRANSACTIONS
  ============================== */

  useEffect(() => {

    if (!user?.id) {

      setTransactions([]);

      setTransactionsLoading(false);

      return;

    }

    setTransactionsLoading(true);

    fetch(
      `http://beamaxtechpractical.online/API/get_transactions.php?user_id=${user.id}`
    )
      .then(response => {

        if (!response.ok) {

          throw new Error(
            `HTTP error! Status: ${response.status}`
          );

        }

        return response.json();

      })
      .then(result => {

        if (
          result.success &&
          Array.isArray(result.transactions)
        ) {

          // get_transactions.php already returns
          // transactions newest first.
          // Dashboard only needs the latest 5.

          setTransactions(
            result.transactions.slice(0, 5)
          );

        } else {

          setTransactions([]);

        }

      })
      .catch(error => {

        console.error(
          "Failed to load recent transactions:",
          error
        );

        setTransactions([]);

      })
      .finally(() => {

        setTransactionsLoading(false);

      });

  }, [user?.id]);

  useEffect(() => {

  if (!user?.id) {
    return;
  }

  fetch(
    `http://beamaxtechpractical.online/API/dashboard_stats.php?user_id=${user.id}`
  )
    .then(response => {

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}`
        );
      }

      return response.json();

    })
    .then(result => {

      console.log("Dashboard API:", result);

      if (result.success) {

        setAnalytics(result.data);

        setBalance(
          Number(result.data.balance || 0)
        );

      }

    })
    .catch(error => {

      console.error(
        "Failed to load dashboard analytics:",
        error
      );

    });

}, [user?.id]);

  /* ==============================
     LOGOUT
  ============================== */

  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/login");

  };


  /* ==============================
     USER VALUES
  ============================== */

  // const username = user?.username || "User";

  // const balance = Number(user?.balance || 0);
const username = user?.username || "User";

  /* ==============================
     TRANSACTION STATUS HELPER
  ============================== */

  const getStatusClass = (status) => {

    const normalizedStatus = String(
      status || "Pending"
    ).toLowerCase();

    if (normalizedStatus === "success") {
      return "success";
    }

    if (normalizedStatus === "failed") {
      return "failed";
    }

    if (normalizedStatus === "reversed") {
      return "reversed";
    }

    return "pending";

  };


  /* ==============================
     TRANSACTION SERVICE HELPER
  ============================== */

  const getTransactionService = (transaction) => {

    if (!transaction?.transaction_type) {
      return "Transaction";
    }

    return transaction.transaction_type
      .replace(/_/g, " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());

  };


  /* ==============================
     TRANSACTION NETWORK HELPER
  ============================== */

  const getTransactionNetwork = (transaction) => {

    return (
      transaction?.network ||
      transaction?.service_provider ||
      "—"
    );

  };


  /* ==============================
     TRANSACTION DATE HELPER
  ============================== */

  const formatTransactionDate = (createdAt) => {

    if (!createdAt) {
      return "—";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  return (

    <div className="dashboard-content">


      {/* =====================================
          SIDEBAR
      ===================================== */}

      {/* <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      /> */}


      {/* =====================================
          MAIN DASHBOARD
      ===================================== */}

      {/* <main className="dashboard-main"> */}


        {/* HEADER */}

        {/* <Header
          openSidebar={() => setSidebarOpen(true)}
        /> */}


        {/* =====================================
            WALLET OVERVIEW
        ===================================== */}

        <section className="wallet-overview">


          {/* MAIN WALLET */}

          <div className="wallet-card primary-wallet">

            <div className="wallet-top">

              <div>

                <span>Main Wallet</span>

                <h4>
                  ₦{balance.toLocaleString()}
                </h4>

              </div>

              <button
                className="eye-btn"
                type="button"
                aria-label="Show balance"
              >
                <i className="bi bi-eye-fill"></i>
              </button>

            </div>

            <div className="wallet-footer">

              <span>
                Available Balance
              </span>

            </div>

          </div>


          {/* BONUS BALANCE */}

          <div className="wallet-card bonus-wallet">

            <div className="wallet-top">

              <span>
                Bonus Balance
              </span>

              <i className="bi bi-gift-fill"></i>

            </div>

            <h3>
              ₦0
            </h3>

            <p>
              Rewards & Cashback
            </p>

          </div>


          {/* REFERRAL */}

          <div className="wallet-card referral-wallet">

            <div className="wallet-top">

              <span>
                Referral Earnings
              </span>

              <i className="bi bi-people-fill"></i>

            </div>

            <h3>
              0
            </h3>

            <p>
              Total Commission Earned
            </p>

          </div>

        </section>



        {/* =====================================
            QUICK ACTIONS
        ===================================== */}

        <section className="dashboard-section">

          <div className="section-title">

            <h3>
              Quick Actions
            </h3>

          </div>


          <div className="quick-actions-grid">

            <div
              className="action-card"
              onClick={() => navigate("/airtime")}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-phone-fill"></i>

              <span>
                Buy Airtime
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => navigate("/data")}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-wifi"></i>

              <span>
                Buy Data
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => {
                console.log("cableTV clicked");
                setShowMaintenanceModal(true);
              }}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-tv-fill"></i>

              <span>
                CableTV
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => {
                console.log("Electricity clicked");
                setShowMaintenanceModal(true);
              }}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-lightning-fill"></i>

              <span>
                Electricity
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => {
                console.log("Education pin clicked");
                setShowMaintenanceModal(true);
              }}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-mortarboard-fill"></i>

              <span>
                Education pin
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => {
                console.log("Recharge Card clicked");
                setShowMaintenanceModal(true);
              }}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-printer-fill"></i>

              <span>
                Recharge Card
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => navigate("/wallet")}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-wallet2"></i>

              <span>
                Fund Wallet
              </span>

            </div>


            <div
              className="action-card"
              onClick={() => navigate("/transactions")}
              style={{ cursor: "pointer" }}
            >

              <i className="bi bi-clock-history"></i>

              <span>
                History
              </span>

            </div>

          </div>

        </section>



        {/* =====================================
            ANALYTICS
        ===================================== */}

        <section className="dashboard-section">

          <div className="section-title">

            <h3>
              Analytics Overview
            </h3>

          </div>


          <div className="analytics-grid">


            <div className="stat-card">

              <h5>
                {Number(
                  analytics.total_transactions || 0
                ).toLocaleString()}
              </h5>

              <span>
                Total Transactions
              </span>

            </div>


            <div className="stat-card">

              <h5>
                {Number(
                  analytics.successful || 0
                ).toLocaleString()}
              </h5>

              <span>
                Successful
              </span>

            </div>


            <div className="stat-card">

              <h5>
                ₦{Number(
                  analytics.airtime_purchased || 0
                ).toLocaleString()}
              </h5>

              <span>
                Airtime Purchased
              </span>

            </div>


            <div className="stat-card">

              <h5>
                ₦{Number(
                  analytics.data_purchased || 0
                ).toLocaleString()}
              </h5>

              <span>
                Data Purchased
              </span>

            </div>


            <div className="stat-card">

              <h5>
                ₦{Number(
                  analytics.wallet_funding || 0
                ).toLocaleString()}
              </h5>

              <span>
                Wallet Funding
              </span>

            </div>


            <div className="stat-card">

              <h5>
                ₦{Number(
                  analytics.referral_earnings || 0
                ).toLocaleString()}
              </h5>

              <span>
                Referral Earnings
              </span>

            </div>

          </div>

        </section>



        {/* =====================================
            MIDDLE SECTION
        ===================================== */}

        <div className="middle-grid">


          {/* =====================================
              RECENT TRANSACTIONS
          ===================================== */}

          <section className="transactions-card">

            <div className="section-title">

              <h3>
                Recent Transactions
              </h3>

            </div>


            <div className="table-responsive">

              <table className="transaction-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Service</th>

                    <th>Network</th>

                    <th>Amount</th>

                    <th>Status</th>

                    <th>Date</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>


                  {/* LOADING */}

                  {transactionsLoading && (

                    <tr>

                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "30px"
                        }}
                      >
                        Loading recent transactions...
                      </td>

                    </tr>

                  )}


                  {/* EMPTY */}

                  {!transactionsLoading &&
                    transactions.length === 0 && (

                    <tr>

                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                          color: "#64748b"
                        }}
                      >
                        No transactions yet.
                      </td>

                    </tr>

                  )}


                  {/* REAL TRANSACTIONS */}

                  {!transactionsLoading &&
                    transactions.length > 0 &&
                    transactions.map((transaction) => {

                      const status =
                        transaction?.status || "Pending";

                      const statusClass =
                        getStatusClass(status);

                      const service =
                        getTransactionService(
                          transaction
                        );

                      const network =
                        getTransactionNetwork(
                          transaction
                        );

                      const amount =
                        Number(
                          transaction?.amount || 0
                        );

                      const date =
                        formatTransactionDate(
                          transaction?.created_at
                        );


                      return (

                        <tr
                          key={
                            transaction?.id ||
                            transaction?.reference
                          }
                        >

                          <td>
                            #
                            {transaction?.reference ||
                              transaction?.id ||
                              "—"}
                          </td>


                          <td>
                            {service}
                          </td>


                          <td>
                            {network}
                          </td>


                          <td>
                            ₦
                            {amount.toLocaleString()}
                          </td>


                          <td>

                            <span
                              className={`status ${statusClass}`}
                            >
                              {status}
                            </span>

                          </td>


                          <td>
                            {date}
                          </td>


                          <td>

                            <button
                              className="view-btn"
                              type="button"
                              onClick={() =>
                                navigate(
                                  "/transactions"
                                )
                              }
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      );

                    })}


                </tbody>

              </table>

            </div>

          </section>



          {/* =====================================
              PROFILE
          ===================================== */}

          <aside className="profile-card">

            <div className="profile-cover"></div>


            <div className="profile-content">

              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="User profile"
              />


              <h4>
                {username}
              </h4>


              <span className="badge-premium">
                Premium Member
              </span>


              <div className="profile-details">


                <div>

                  <strong>
                    Email
                  </strong>

                  <span>
                    {user?.email || "user@email.com"}
                  </span>

                </div>


                <div>

                  <strong>
                    Status
                  </strong>

                  <span>
                    Verified
                  </span>

                </div>


                <div>

                  <strong>
                    Referral Code
                  </strong>

                  <span>
                    SUB12345
                  </span>

                </div>


                <div>

                  <strong>
                    Level
                  </strong>

                  <span>
                    Gold
                  </span>

                </div>


              </div>

            </div>

          </aside>

        </div>



        {/* =====================================
            PROMOTIONS
        ===================================== */}

        <section className="promo-grid">


          <div className="promo-card referral">

            <h3>
              Earn More Referrals
            </h3>

            <p>
              Invite friends and earn commissions
              on every transaction.
            </p>

            <button type="button">
              Invite Friends
            </button>

          </div>


          <div className="promo-card cashback">

            <h3>
              5% Cashback Offer
            </h3>

            <p>
              Enjoy cashback rewards on selected
              VTU services.
            </p>

            <button type="button">
              Claim Reward
            </button>

          </div>


          <div className="promo-card offer">

            <h3>
              Exclusive Promotion
            </h3>

            <p>
              Buy data bundles and enjoy instant
              bonus credits.
            </p>

            <button type="button">
              Explore
            </button>

          </div>


        </section>



        {/* =====================================
            ACTIVITY TIMELINE
        ===================================== */}

        <section className="timeline-section">


          <div className="section-title">

            <h3>
              Activity Timeline
            </h3>

          </div>


          <div className="timeline">


            <div className="timeline-item">

              <div className="timeline-dot"></div>

              <div className="timeline-content">

                <h6>
                  Wallet Funded
                </h6>

                <p>
                  ₦20,000 added successfully.
                </p>

                <span>
                  10 mins ago
                </span>

              </div>

            </div>


            <div className="timeline-item">

              <div className="timeline-dot"></div>

              <div className="timeline-content">

                <h6>
                  Data Purchase
                </h6>

                <p>
                  MTN 10GB purchased.
                </p>

                <span>
                  35 mins ago
                </span>

              </div>

            </div>


            <div className="timeline-item">

              <div className="timeline-dot"></div>

              <div className="timeline-content">

                <h6>
                  Referral Commission
                </h6>

                <p>
                  You earned ₦500 referral bonus.
                </p>

                <span>
                  1 hour ago
                </span>

              </div>

            </div>


          </div>

        </section>


        {/* =====================================
            MAINTENANCE MODAL
        ===================================== */}

        {showMaintenanceModal && (

          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              zIndex: 9999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            <div
              style={{
                backgroundColor: "#ffffff",
                width: "90%",
                maxWidth: "420px",
                padding: "35px",
                borderRadius: "20px",
                textAlign: "center",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.4)",
              }}
            >

              <div
                style={{
                  fontSize: "45px",
                  marginBottom: "15px"
                }}
              >
                🛠️
              </div>


              <h2
                style={{
                  marginBottom: "12px",
                  color: "#061B33"
                }}
              >
                Service Temporarily Unavailable
              </h2>


              <p
                style={{
                  color: "#64748B",
                  lineHeight: "1.6"
                }}
              >
                This service is currently undergoing
                maintenance. Please try again later.
              </p>


              <button
                type="button"
                onClick={() =>
                  setShowMaintenanceModal(false)
                }
                style={{
                  marginTop: "20px",
                  padding: "12px 28px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#0066FF",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Got it
              </button>

            </div>

          </div>

        )}

    </div>

  );

}

export default Dashboard;
