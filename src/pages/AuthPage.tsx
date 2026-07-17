import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mcas/design-system";
import { useAuth } from "@mcas/auth-client";

type LocationState = { from?: { pathname?: string } };

export function AuthPage() {
  const { authEnabled, isAuthenticated, isLoading, login, loginError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from =
    (location.state as LocationState | null)?.from?.pathname &&
    (location.state as LocationState).from!.pathname !== "/auth"
      ? (location.state as LocationState).from!.pathname!
      : "/";

  useEffect(() => {
    if (authEnabled && isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [authEnabled, from, isAuthenticated, isLoading, navigate]);

  if (!authEnabled) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="auth-page">
        <p className="home-page__status">Checking session…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Sign in</h1>
        <p className="auth-page__intro">
          Sign in with your Microsoft account to access the MCAS portal and tools.
        </p>
        {loginError && <p className="home-page__error">{loginError}</p>}
        <Button
          onClick={() => {
            void login().catch(() => {
              /* loginError is shown below */
            });
          }}
          disabled={isLoading}
        >
          Sign in with Microsoft
        </Button>
      </div>
    </div>
  );
}
