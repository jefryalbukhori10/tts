import React from "react";
import { Navigate } from "react-router-dom";
import useAdmin from "./hooks/useAdmin";
import Loading from "./components/Loading";

export default function AdminRoute({ children }) {
  const { admin, loading } = useAdmin();

  if (loading) return <Loading />;

  if (!admin) return <Navigate to="/admin" replace />;

  return children;
}
