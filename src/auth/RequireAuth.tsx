import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import type { ReactNode } from "react";

/**
 * When MSAL is enabled, require a valid MCAS session. NoAuth / DEV mode skips the gate.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { authEnabled, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (!authEnabled) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="home-page">
        <p className="home-page__status">Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
