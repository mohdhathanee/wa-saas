import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Only block newly created unverified accounts
  if (
    !user.emailVerified &&
    user.metadata.creationTime === user.metadata.lastSignInTime
  ) {
    return <Navigate to="/verify" replace />;
  }

  return children;
}
