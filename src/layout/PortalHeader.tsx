import { NavLink } from "react-router-dom";
import { Avatar, Button } from "@mcas/design-system";
import { useAuth } from "@mcas/auth-client";
import "./portal.css";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `app-header__nav-link${isActive ? " app-header__nav-link--active" : ""}`;

export function PortalHeader() {
  const { authEnabled, isAuthenticated, isLoading, user, login, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo">MCAS</span>
        <span className="app-header__subtitle">Portal</span>
      </div>
      <nav className="app-header__nav" aria-label="Main">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/admin/tools" className={navLinkClass}>
          Admin
        </NavLink>
        <NavLink to="/design-system/tokens" className={navLinkClass}>
          Tokens
        </NavLink>
        <NavLink to="/design-system/components" className={navLinkClass}>
          Components
        </NavLink>
        <NavLink to="/design-system/agent-progress" className={navLinkClass}>
          Agent progress
        </NavLink>
      </nav>
      <div className="app-header__actions">
        {authEnabled ? (
          isAuthenticated && user ? (
            <>
              <Avatar label={user.email ?? user.sub} />
              <span className="app-header__user">{user.email ?? user.sub}</span>
              <Button variant="secondary" onClick={() => void logout()} disabled={isLoading}>
                Log out
              </Button>
            </>
          ) : (
            <Button onClick={() => void login()} disabled={isLoading}>
              Sign in
            </Button>
          )
        ) : (
          <span className="app-header__dev-badge">Dev mode (no auth)</span>
        )}
      </div>
    </header>
  );
}
