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


function App() {
  return (
    <Routes>

      {/* Public Pages */}

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

      {/* TEMPORARY SESSION TEST */}
      <Route
        path="/session-test"
        element={<SessionTest />}
      />


      {/* Protected Pages */}

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