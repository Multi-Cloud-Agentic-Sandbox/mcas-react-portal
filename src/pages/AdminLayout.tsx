import { HasRight, useAuth } from "@mcas/auth-client";
import { Text } from "@mcas/design-system";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import {
  RIGHT_RBAC_MANAGE,
  RIGHT_REGISTRIES_MANAGE,
  RIGHT_USERS_MANAGE,
} from "../api/authAdminClient";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `admin-tabs__tab${isActive ? " admin-tabs__tab--active" : ""}`;

function firstAdminPath(canTools: boolean, canUsers: boolean, canRbac: boolean): string {
  if (canTools) return "/admin/tools";
  if (canUsers) return "/admin/users";
  if (canRbac) return "/admin/groups";
  return "/";
}

export function AdminIndexRedirect() {
  const { user, getMcasToken } = useAuth();
  const subject = user ?? getMcasToken();
  return (
    <Navigate
      to={firstAdminPath(
        HasRight(subject, RIGHT_REGISTRIES_MANAGE),
        HasRight(subject, RIGHT_USERS_MANAGE),
        HasRight(subject, RIGHT_RBAC_MANAGE),
      )}
      replace
    />
  );
}

export function AdminLayout() {
  const { user, getMcasToken } = useAuth();
  const subject = user ?? getMcasToken();

  const canTools = HasRight(subject, RIGHT_REGISTRIES_MANAGE);
  const canUsers = HasRight(subject, RIGHT_USERS_MANAGE);
  const canRbac = HasRight(subject, RIGHT_RBAC_MANAGE);

  if (!canTools && !canUsers && !canRbac) {
    return (
      <div className="admin-page">
        <h1 className="admin-page__title">Admin</h1>
        <Text variant="muted">You do not have any admin rights.</Text>
      </div>
    );
  }

  return (
    <div className="admin-page admin-page--wide">
      <h1 className="admin-page__title">Admin</h1>
      <nav className="admin-tabs" aria-label="Admin sections">
        {canTools ? (
          <NavLink to="/admin/tools" className={tabClass}>
            Tools
          </NavLink>
        ) : null}
        {canUsers ? (
          <NavLink to="/admin/users" className={tabClass}>
            Users
          </NavLink>
        ) : null}
        {canRbac ? (
          <NavLink to="/admin/groups" className={tabClass}>
            Groups
          </NavLink>
        ) : null}
        {canRbac ? (
          <NavLink to="/admin/roles" className={tabClass}>
            Roles
          </NavLink>
        ) : null}
      </nav>
      <div className="admin-tabs__panel">
        <Outlet />
      </div>
    </div>
  );
}
