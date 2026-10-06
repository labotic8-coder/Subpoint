import { Navigate, Outlet } from "react-router-dom";

function AdminAuthRoute() {
  const adminLoggedIn = localStorage.getItem("adminLoggedIn");

  if (adminLoggedIn === "true") {
    return <Outlet />;
  }

  return <Navigate to="/admin/login" replace />;
}

export default AdminAuthRoute;