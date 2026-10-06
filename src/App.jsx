
import DashboardLayout from "./user/DashboardLayout";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import About from "./pages/About";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";

import Dashboard from "./user/dashboard";
import AuthoRoute from "../AuthoRoute";

import DataBundle from "./user/dataBundle";
import ElectriCity from "./user/ElectriCity";
import CableTv from "./user/CableTv";
import Wallet from "./user/Wallet";
import Transaction from "./user/Transaction";
import ProfileSettings from "./user/ProfileSettings";
import Airtime from "./user/Airtime";

import SessionTest from "./SessionTest";

// =========================================
// ADMIN
// =========================================

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminAuthRoute from "../AdminAuthRoute";


function App() {
  return (
    <Routes>

      {/* =========================================
          PUBLIC PAGES
          ========================================= */}

      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
          </>
        }
      />

      <Route
        path="/login"
        element={
          <>
            <Navbar />
            <Login />
          </>
        }
      />

      <Route
        path="/register"
        element={
          <>
            <Navbar />
            <Register />
          </>
        }
      />

      <Route
        path="/about"
        element={
          <>
            <Navbar />
            <About />
          </>
        }
      />


      {/* =========================================
          TEMPORARY SESSION TEST
          ========================================= */}

      <Route
        path="/session-test"
        element={<SessionTest />}
      />


      {/* =========================================
          ADMIN LOGIN
          
          Public admin login page
          ========================================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =========================================
          PROTECTED ADMIN PAGES
          
          All admin pages are protected by
          AdminAuthRoute.
          ========================================= */}

      <Route element={<AdminAuthRoute />}>

        {/* =========================================
            ADMIN DASHBOARD
            ========================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        {/* =========================================
            ADMIN USERS
            ========================================= */}

        <Route
          path="/admin/users"
          element={
            <div
              style={{
                padding: "40px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Admin Users Page
            </div>
          }
        />


        {/* =========================================
            ADMIN TRANSACTIONS
            ========================================= */}

        <Route
          path="/admin/transactions"
          element={
            <div
              style={{
                padding: "40px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Admin Transactions Page
            </div>
          }
        />


        {/* =========================================
            ADMIN FUNDING
            ========================================= */}

        <Route
          path="/admin/funding"
          element={
            <div
              style={{
                padding: "40px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Admin Funding Page
            </div>
          }
        />


        {/* =========================================
            ADMIN ANALYTICS
            ========================================= */}

        <Route
          path="/admin/analytics"
          element={
            <div
              style={{
                padding: "40px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Admin Analytics Page
            </div>
          }
        />


        {/* =========================================
            ADMIN SERVICES
            ========================================= */}

        <Route
          path="/admin/services"
          element={
            <div
              style={{
                padding: "40px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Admin Services Page
            </div>
          }
        />


        {/* =========================================
            ADMIN SETTINGS
            ========================================= */}

        <Route
          path="/admin/settings"
          element={
            <div
              style={{
                padding: "40px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Admin Settings Page
            </div>
          }
        />

      </Route>


      {/* =========================================
          PROTECTED CUSTOMER PAGES
          
          Existing customer authentication
          remains completely unchanged.
          ========================================= */}

      <Route element={<AuthoRoute />}>

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/airtime"
          element={
            <DashboardLayout>
              <Airtime />
            </DashboardLayout>
          }
        />

        <Route
          path="/data"
          element={
            <DashboardLayout>
              <DataBundle />
            </DashboardLayout>
          }
        />

        <Route
          path="/electricity"
          element={
            <DashboardLayout>
              <ElectriCity />
            </DashboardLayout>
          }
        />

        <Route
          path="/cable"
          element={
            <DashboardLayout>
              <CableTv />
            </DashboardLayout>
          }
        />

        <Route
          path="/wallet"
          element={
            <DashboardLayout>
              <Wallet />
            </DashboardLayout>
          }
        />

        <Route
          path="/transactions"
          element={
            <DashboardLayout>
              <Transaction />
            </DashboardLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <ProfileSettings />
            </DashboardLayout>
          }
        />

      </Route>

    </Routes>
  );
}

export default App;

