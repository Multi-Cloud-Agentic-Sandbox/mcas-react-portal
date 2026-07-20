import { NavLink, useLocation } from "react-router-dom";
import { Avatar, Button } from "@mcas/design-system";
import { HasRight, useAuth } from "@mcas/auth-client";
import {
  RIGHT_RBAC_MANAGE,
  RIGHT_REGISTRIES_MANAGE,
  RIGHT_USERS_MANAGE,
} from "../api/authAdminClient";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `app-header__nav-link${isActive ? " app-header__nav-link--active" : ""}`;

export function PortalHeader() {
  const { authEnabled, isAuthenticated, isLoading, user, logout, getMcasToken } = useAuth();
  const location = useLocation();
  const subject = user ?? getMcasToken();
  const showAdmin =
    HasRight(subject, RIGHT_USERS_MANAGE) ||
    HasRight(subject, RIGHT_RBAC_MANAGE) ||
    HasRight(subject, RIGHT_REGISTRIES_MANAGE);
  const adminActive = location.pathname.startsWith("/admin");

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
        {showAdmin ? (
          <NavLink to="/admin" className={() => navLinkClass({ isActive: adminActive })}>
            Admin
          </NavLink>
        ) : null}
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
          ) : null
        ) : (
          <span className="app-header__dev-badge">Dev mode (no auth)</span>
        )}
      </div>
    </header>
  );
}
