import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../../services/client";
export default function ProtectedRoute() {
  return getSession() ? <Outlet /> : <Navigate to="/login" replace />;
}
