import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || "").toUpperCase();

  // Allow TEACHER / PROFESSOR interchangeability
  const hasAccess = allowedRoles.some((allowed) => {
    const norm = allowed.toUpperCase();
    if (norm === role) return true;
    if (norm === "FACULTY" && (role === "TEACHER" || role === "PROFESSOR")) return true;
    if (norm === "TEACHER" && role === "PROFESSOR") return true;
    if (norm === "PROFESSOR" && role === "TEACHER") return true;
    return false;
  });

  if (!hasAccess) {
    // Redirect to their respective authorized dashboard
    if (role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    if (role === "TEACHER" || role === "PROFESSOR") return <Navigate to="/teacher" replace />;
    if (role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
