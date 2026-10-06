
import React, { useEffect, useState } from "react";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiArrowUpRight,
  FiArrowDownRight,
  FiSmartphone,
  FiWifi,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiActivity,
  FiUserPlus,
  FiRefreshCw,
  FiMoreVertical,
} from "react-icons/fi";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // =========================================
  // ADMIN STATISTICS
  // =========================================

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalFunding, setTotalFunding] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =========================================
  // TRANSACTION OVERVIEW
  // =========================================

  const [transactionOverview, setTransactionOverview] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    reversed: 0,
    daily: [],
  });

  // =========================================
  // RECENT TRANSACTIONS
  // =========================================

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingRecentTransactions, setLoadingRecentTransactions] =
    useState(true);

  // =========================================
  // LOAD ADMIN STATISTICS
  // =========================================

  const fetchAdminStats = async () => {
    try {
      setLoadingUsers(true);

      const response = await fetch(
        "http://beamaxtechpractical.online/API/admin.php/admin_stats.php",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setTotalUsers(data.data.total_users);
        setTotalTransactions(data.data.total_transactions);
        setTotalFunding(data.data.total_funding);
        setTotalProfit(data.data.total_profit);

        if (data.data.transaction_overview) {
          setTransactionOverview(data.data.transaction_overview);
        }
      } else {
        console.error("Admin statistics error:", data.message);
      }
    } catch (error) {
      console.error("Unable to load admin statistics:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =========================================
  // FORMAT SERVICE NAME
  // =========================================

  const formatServiceName = (type) => {
    if (!type) {
      return "Unknown";
    }

    const serviceMap = {
      airtime: "Airtime",
      data: "Data",
      funding: "Funding",
      cable: "Cable TV",
      electricity: "Electricity",
      exam_pin: "Exam PIN",
      transfer: "Transfer",
      withdrawal: "Withdrawal",
      refund: "Refund",
    };

    if (serviceMap[type]) {
      return serviceMap[type];
    }

    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================
  // FORMAT NETWORK
  // =========================================

  const formatNetworkName = (network) => {
    if (!network) {
      return "—";
    }

    const networkMap = {
      mtn: "MTN",
      glo: "Glo",
      airtel: "Airtel",
      "9mobile": "9mobile",
      paystack: "Paystack",
    };

    const lowerNetwork = String(network).toLowerCase();

    return networkMap[lowerNetwork] || network;
  };

  // =========================================
  // FORMAT TRANSACTION DATE
  // =========================================

  const formatTransactionDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // =========================================
  // LOAD RECENT TRANSACTIONS
  // =========================================

  const fetchRecentTransactions = async () => {
    try {
      setLoadingRecentTransactions(true);

      const response = await fetch(
        "http://beamaxtechpractical.online/API/admin.php/admin_recent_transactions.php",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const formattedTransactions = (data.data.transactions || []).map(
          (transaction) => ({
            id: transaction.id,
            reference: transaction.reference,
            user: transaction.username || "Unknown User",
            service: formatServiceName(transaction.transaction_type),
            network: formatNetworkName(transaction.network),
            amount: `₦${Number(transaction.amount).toLocaleString()}`,
            status: transaction.status,
            date: formatTransactionDate(transaction.created_at),
          })
        );

        setRecentTransactions(formattedTransactions);
      } else {
        console.error("Recent transactions error:", data.message);
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error("Unable to load recent transactions:", error);
      setRecentTransactions([]);
    } finally {
      setLoadingRecentTransactions(false);
    }
  };

  // =========================================
  // LOAD DASHBOARD DATA
  // =========================================

  useEffect(() => {
    fetchAdminStats();
    fetchRecentTransactions();
  }, []);

  // =========================================
  // REFRESH DASHBOARD DATA
  // =========================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        fetchAdminStats(),
        fetchRecentTransactions(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================
  // SIDEBAR MENU
  // =========================================

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FiGrid />,
      sectionId: "dashboard-section",
    },
    {
      title: "Users",
      icon: <FiUsers />,
      sectionId: "users-section",
    },
    {
      title: "Transactions",
      icon: <FiCreditCard />,
      sectionId: "transactions-section",
    },
    {
      title: "Funding",
      icon: <FiDollarSign />,
      sectionId: "funding-section",
    },
    {
      title: "Analytics",
      icon: <FiBarChart2 />,
      sectionId: "analytics-section",
    },
    {
      title: "Services",
      icon: <FiActivity />,
      sectionId: "services-section",
    },
    {
      title: "Settings",
      icon: <FiSettings />,
      sectionId: "settings-section",
    },
  ];

  // =========================================
  // SMOOTH SCROLL NAVIGATION
  // =========================================

  const scrollToSection = (sectionId, menuTitle) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      console.warn(`Section "${sectionId}" was not found.`);
      return;
    }

    setActiveMenu(menuTitle);
    setSidebarOpen(false);

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // =========================================
  // SIDEBAR MENU CLICK
  // =========================================

  const handleMenuClick = (menu) => {
    scrollToSection(menu.sectionId, menu.title);
  };

  // =========================================
  // SCROLL SPY
  // =========================================

  useEffect(() => {
    const sections = menuItems
      .map((menu) => ({
        ...menu,
        element: document.getElementById(menu.sectionId),
      }))
      .filter((item) => item.element);

    if (!sections.length) {
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      let currentSection = sections[0];

      sections.forEach((section) => {
        if (section.element.offsetTop <= scrollPosition) {
          currentSection = section;
        }
      });

      setActiveMenu(currentSection.title);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");

    window.location.href = "/admin/login";
  };

  // =========================================
  // STATISTICS CARDS
  // =========================================

  const stats = [
    {
      title: "Total Users",
      value: loadingUsers ? "..." : totalUsers.toLocaleString(),
      change: "+12.5%",
      positive: true,
      icon: <FiUsers />,
      className: "blue",
    },
    {
      title: "Total Transactions",
      value: loadingUsers
        ? "..."
        : totalTransactions.toLocaleString(),
      change: "+8.2%",
      positive: true,
      icon: <FiCreditCard />,
      className: "purple",
    },
    {
      title: "Total Funding",
      value: loadingUsers
        ? "..."
        : `₦${totalFunding.toLocaleString()}`,
      change: "+15.4%",
      positive: true,
      icon: <FiDollarSign />,
      className: "green",
    },
    {
      title: "Total Profit",
      value: loadingUsers
        ? "..."
        : `₦${totalProfit.toLocaleString()}`,
      change: "+10.8%",
      positive: true,
      icon: <FiDollarSign />,
      className: "orange",
    },
  ];

  // =========================================
  // SERVICES
  // =========================================

  const services = [
    {
      name: "Airtime",
      icon: <FiSmartphone />,
      transactions: "3,482",
      percentage: "41%",
    },
    {
      name: "Data",
      icon: <FiWifi />,
      transactions: "2,918",
      percentage: "35%",
    },
    {
      name: "Wallet Funding",
      icon: <FiDollarSign />,
      transactions: "1,526",
      percentage: "18%",
    },
    {
      name: "Other Services",
      icon: <FiActivity />,
      transactions: "500",
      percentage: "6%",
    },
  ];

  // =========================================
  // CHART DATA
  // =========================================

  const dailyTransactions = transactionOverview.daily || [];

  const chartMaxValue = Math.max(
    ...dailyTransactions.map(
      (item) => Number(item.total) || 0
    ),
    1
  );

  const chartWidth = 700;
  const chartHeight = 230;

  const chartPoints = dailyTransactions.map(
    (item, index) => {
      const value = Number(item.total) || 0;

      const x =
        dailyTransactions.length > 1
          ? (index / (dailyTransactions.length - 1)) *
            chartWidth
          : chartWidth / 2;

      const y =
        chartHeight -
        (value / chartMaxValue) * 190;

      return {
        x,
        y,
        value,
      };
    }
  );

  const chartLinePath = chartPoints
    .map((point, index) => {
      if (index === 0) {
        return `M${point.x},${point.y}`;
      }

      return `L${point.x},${point.y}`;
    })
    .join(" ");

  const chartFillPath =
    chartPoints.length > 0
      ? `${chartLinePath} L700,230 L0,230 Z`
      : "";

  return (
    <div className="admin-app">

      {/* =========================================
          MOBILE OVERLAY
          ========================================= */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
          ========================================= */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-brand">

          <div className="admin-brand-icon">
            <span>S</span>
          </div>

          <div className="admin-brand-text">
            <h2>SubtoUse</h2>
            <span>ADMIN PANEL</span>
          </div>

          <button
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX />
          </button>

        </div>

        <div className="admin-sidebar-section">

          <span className="admin-section-title">
            MAIN MENU
          </span>

          <nav className="admin-navigation">

            {menuItems.map((item) => (
              <button
                key={item.title}
                className={`admin-nav-item ${
                  activeMenu === item.title
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleMenuClick(item)
                }
              >

                <span className="admin-nav-icon">
                  {item.icon}
                </span>

                <span>
                  {item.title}
                </span>

                {item.title === "Transactions" && (
                  <span className="admin-nav-badge">
                    12
                  </span>
                )}

              </button>
            ))}

          </nav>

        </div>

        <div className="admin-sidebar-bottom">

          <div className="admin-support-card">

            <div className="support-icon">
              <FiActivity />
            </div>

            <div>

              <strong>
                System Status
              </strong>

              <span>
                <i></i>
                All systems operational
              </span>

            </div>

          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =========================================
          MAIN AREA
          ========================================= */}

      <main className="admin-main">

        {/* =========================================
            HEADER
            ========================================= */}

        <header className="admin-header">

          <div className="admin-header-left">

            <button
              className="admin-menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu />
            </button>

            <div>

              <h1>Dashboard</h1>

              <p>
                Monitor and manage your
                SubtoUse platform.
              </p>

            </div>

          </div>

          <div className="admin-header-right">

            <button className="admin-header-icon">
              <FiSearch />
            </button>

            <button className="admin-header-icon notification-button">
              <FiBell />
              <span className="notification-dot"></span>
            </button>

            <div className="admin-profile">

              <div className="admin-avatar">
                OE
              </div>

              <div className="admin-profile-info">
                <strong>Admin</strong>
                <span>Owner</span>
              </div>

              <FiChevronDown className="profile-arrow" />

            </div>

          </div>

        </header>

        {/* =========================================
            DASHBOARD CONTENT
            ========================================= */}

        <div className="admin-content">

          {/* =========================================
              DASHBOARD / WELCOME / CARDS
              ========================================= */}

          <section
            id="dashboard-section"
            className="admin-dashboard-section"
          >

            <section className="admin-welcome">

              <div>

                <span className="welcome-label">
                  OVERVIEW
                </span>

                <h2>
                  Welcome back, Admin 👋
                </h2>

                <p>
                  Here is what's happening across
                  your SubtoUse platform today.
                </p>

              </div>

              <button
                className="date-button"
                onClick={handleRefresh}
                disabled={refreshing}
              >

                <FiRefreshCw
                  className={
                    refreshing
                      ? "refresh-spinning"
                      : ""
                  }
                />

                <span>
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh Data"}
                </span>

              </button>

            </section>

            {/* =========================================
                STATISTICS
                ========================================= */}

            <section
              id="users-section"
              className="admin-stats-grid"
            >

              {stats.map((stat) => (

                <div
                  className="admin-stat-card"
                  key={stat.title}
                >

                  <div className="stat-card-top">

                    <div
                      className={`stat-icon ${stat.className}`}
                    >
                      {stat.icon}
                    </div>

                    <button className="stat-more">
                      <FiMoreVertical />
                    </button>

                  </div>

                  <div className="stat-card-content">

                    <span>
                      {stat.title}
                    </span>

                    <h3>
                      {stat.value}
                    </h3>

                    <div
                      className={`stat-change ${
                        stat.positive
                          ? "positive"
                          : "negative"
                      }`}
                    >

                      {stat.positive ? (
                        <FiArrowUpRight />
                      ) : (
                        <FiArrowDownRight />
                      )}

                      <strong>
                        {stat.change}
                      </strong>

                      <span>
                        from last month
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </section>

          </section>

          {/* =========================================
              ANALYTICS
              ========================================= */}

          <section
            id="analytics-section"
            className="admin-analytics-grid"
          >

            {/* TRANSACTION OVERVIEW */}

            <div className="admin-panel sales-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Transaction Overview
                  </h3>

                  <p>
                    Transaction performance over
                    the last 7 days
                  </p>

                </div>

                <select
                  className="period-select"
                  defaultValue="7"
                >

                  <option value="7">
                    Last 7 days
                  </option>

                  <option value="30">
                    Last 30 days
                  </option>

                  <option value="90">
                    Last 3 months
                  </option>

                </select>

              </div>

              <div className="chart-summary">

                <div>

                  <span>
                    Total Transactions
                  </span>

                  <strong>
                    {transactionOverview.total.toLocaleString()}
                  </strong>

                </div>

                <div>

                  <span>
                    Successful
                  </span>

                  <strong className="success-number">
                    {transactionOverview.successful.toLocaleString()}
                  </strong>

                </div>

                <div>

                  <span>
                    Failed
                  </span>

                  <strong className="danger-number">
                    {transactionOverview.failed.toLocaleString()}
                  </strong>

                </div>

              </div>

              <div className="chart">

                <div className="chart-y-axis">

                  <span>
                    {Math.ceil(
                      chartMaxValue / 10
                    ) * 10}
                  </span>

                  <span>
                    {Math.round(
                      Math.ceil(
                        chartMaxValue / 10
                      ) *
                        10 *
                        0.8
                    )}
                  </span>

                  <span>
                    {Math.round(
                      Math.ceil(
                        chartMaxValue / 10
                      ) *
                        10 *
                        0.6
                    )}
                  </span>

                  <span>
                    {Math.round(
                      Math.ceil(
                        chartMaxValue / 10
                      ) *
                        10 *
                        0.4
                    )}
                  </span>

                  <span>
                    {Math.round(
                      Math.ceil(
                        chartMaxValue / 10
                      ) *
                        10 *
                        0.2
                    )}
                  </span>

                  <span>
                    0
                  </span>

                </div>

                <div className="chart-area">

                  <div className="chart-grid-line line-1"></div>
                  <div className="chart-grid-line line-2"></div>
                  <div className="chart-grid-line line-3"></div>
                  <div className="chart-grid-line line-4"></div>
                  <div className="chart-grid-line line-5"></div>

                  <svg
                    className="sales-line"
                    viewBox="0 0 700 230"
                    preserveAspectRatio="none"
                  >

                    <defs>

                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity="0.22"
                        />

                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity="0"
                        />

                      </linearGradient>

                    </defs>

                    {chartPoints.length > 0 && (
                      <>
                        <path
                          className="chart-fill"
                          d={chartFillPath}
                        />

                        <path
                          className="chart-line-path"
                          d={chartLinePath}
                        />

                        {chartPoints.map(
                          (point, index) => (
                            <circle
                              key={index}
                              cx={point.x}
                              cy={point.y}
                              r={
                                index ===
                                chartPoints.length - 1
                                  ? 5
                                  : 4
                              }
                            />
                          )
                        )}
                      </>
                    )}

                  </svg>

                  <div className="chart-days">

                    {dailyTransactions.map(
                      (item, index) => (
                        <span key={index}>
                          {item.day}
                        </span>
                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* =========================================
                SERVICES
                ========================================= */}

            <div
              id="services-section"
              className="admin-panel services-panel"
            >

              <div className="panel-header">

                <div>

                  <h3>
                    Service Usage
                  </h3>

                  <p>
                    Transactions by service
                  </p>

                </div>

                <button
                  className="panel-action"
                  onClick={() =>
                    scrollToSection(
                      "services-section",
                      "Services"
                    )
                  }
                >
                  View all
                </button>

              </div>

              <div className="service-list">

                {services.map(
                  (service, index) => (

                    <div
                      className="service-item"
                      key={service.name}
                    >

                      <div
                        className={`service-icon service-${
                          index + 1
                        }`}
                      >
                        {service.icon}
                      </div>

                      <div className="service-info">

                        <div>

                          <strong>
                            {service.name}
                          </strong>

                          <span>
                            {service.transactions}{" "}
                            transactions
                          </span>

                        </div>

                        <b>
                          {service.percentage}
                        </b>

                        <div className="service-progress">

                          <div
                            style={{
                              width:
                                service.percentage,
                            }}
                          ></div>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </section>

          {/* =========================================
              FUNDING SECTION
              ========================================= */}

          <section
            id="funding-section"
            className="admin-funding-anchor"
          >
            <div
              className="admin-panel"
              style={{ display: "none" }}
            >
              Funding section
            </div>
          </section>

          {/* =========================================
              RECENT TRANSACTIONS
              ========================================= */}

          <section
            id="transactions-section"
            className="admin-bottom-grid"
          >

            <div className="admin-panel transactions-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Recent Transactions
                  </h3>

                  <p>
                    Latest activity on your
                    platform
                  </p>

                </div>

                <button
                  className="panel-action"
                  onClick={() =>
                    scrollToSection(
                      "transactions-section",
                      "Transactions"
                    )
                  }
                >
                  View all
                </button>

              </div>

              <div className="transactions-table-wrapper">

                <table className="transactions-table">

                  <thead>

                    <tr>
                      <th>Transaction</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>

                  </thead>

                  <tbody>

                    {loadingRecentTransactions ? (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          Loading recent transactions...
                        </td>

                      </tr>

                    ) : recentTransactions.length === 0 ? (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          No recent transactions found.
                        </td>

                      </tr>

                    ) : (

                      recentTransactions.map(
                        (transaction) => (

                          <tr
                            key={transaction.id}
                          >

                            <td>

                              <div className="transaction-user">

                                <div className="transaction-avatar">

                                  {transaction.user
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word[0]
                                    )
                                    .join("")
                                    .substring(
                                      0,
                                      2
                                    )
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {
                                      transaction.user
                                    }
                                  </strong>

                                  <span>
                                    {
                                      transaction.reference
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <div className="service-cell">

                                <strong>
                                  {
                                    transaction.service
                                  }
                                </strong>

                                <span>
                                  {
                                    transaction.network
                                  }
                                </span>

                              </div>

                            </td>

                            <td>

                              <strong className="amount-cell">
                                {
                                  transaction.amount
                                }
                              </strong>

                            </td>

                            <td>

                              <span
                                className={`status-badge ${transaction.status.toLowerCase()}`}
                              >

                                {transaction.status ===
                                  "Success" && (
                                  <FiCheckCircle />
                                )}

                                {transaction.status ===
                                  "Pending" && (
                                  <FiClock />
                                )}

                                {transaction.status ===
                                  "Failed" && (
                                  <FiXCircle />
                                )}

                                {
                                  transaction.status
                                }

                              </span>

                            </td>

                            <td>

                              <span className="date-cell">
                                {
                                  transaction.date
                                }
                              </span>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =========================================
                QUICK ACTIONS
                ========================================= */}

            <div className="admin-panel quick-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Quick Actions
                  </h3>

                  <p>
                    Common administrative tasks
                  </p>

                </div>

              </div>

              <div className="quick-actions">

                <button
                  onClick={() =>
                    scrollToSection(
                      "users-section",
                      "Users"
                    )
                  }
                >

                  <span className="quick-icon blue">
                    <FiUserPlus />
                  </span>

                  <span>

                    <strong>
                      Manage Users
                    </strong>

                    <small>
                      View all registered users
                    </small>

                  </span>

                  <FiArrowUpRight />

                </button>

                <button
                  onClick={() =>
                    scrollToSection(
                      "funding-section",
                      "Funding"
                    )
                  }
                >

                  <span className="quick-icon green">
                    <FiDollarSign />
                  </span>

                  <span>

                    <strong>
                      Funding History
                    </strong>

                    <small>
                      Review wallet funding
                    </small>

                  </span>

                  <FiArrowUpRight />

                </button>

                <button
                  onClick={() =>
                    scrollToSection(
                      "analytics-section",
                      "Analytics"
                    )
                  }
                >

                  <span className="quick-icon purple">
                    <FiBarChart2 />
                  </span>

                  <span>

                    <strong>
                      View Analytics
                    </strong>

                    <small>
                      Analyze platform performance
                    </small>

                  </span>

                  <FiArrowUpRight />

                </button>

                <button
                  onClick={() =>
                    scrollToSection(
                      "settings-section",
                      "Settings"
                    )
                  }
                >

                  <span className="quick-icon orange">
                    <FiSettings />
                  </span>

                  <span>

                    <strong>
                      System Settings
                    </strong>

                    <small>
                      Manage your platform
                    </small>

                  </span>

                  <FiArrowUpRight />

                </button>

              </div>

            </div>

          </section>

          {/* =========================================
              SETTINGS ANCHOR
              ========================================= */}

          <section
            id="settings-section"
            className="admin-settings-anchor"
          >
          </section>

          {/* =========================================
              FOOTER
              ========================================= */}

          <footer className="admin-footer">

            <span>
              © 2026 SubtoUse. All rights reserved.
            </span>

            <span className="footer-status">

              <i></i>

              System operational

            </span>

          </footer>

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;

