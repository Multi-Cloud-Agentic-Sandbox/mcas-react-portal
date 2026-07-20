import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import { Button, Text } from "@mcas/design-system";
import {
  getUser,
  listGroups,
  listRoles,
  setUserGroups,
  setUserRoles,
  type AdminGroup,
  type AdminRole,
  type AdminUser,
} from "../../api/authAdminClient";

export function UserDetailPage() {
  const { uid = "" } = useParams();
  const { ensureMcasToken } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const token = await ensureMcasToken();
    const [u, r, g] = await Promise.all([
      getUser(token, uid),
      listRoles(token),
      listGroups(token),
    ]);
    setUser(u);
    setRoles(r);
    setGroups(g);
  };

  useEffect(() => {
    if (!uid) return;
    void reload().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load user");
      setUser(null);
    });
  }, [uid]);

  const toggleRole = async (roleId: string) => {
    if (!user) return;
    const next = user.roleIds.includes(roleId)
      ? user.roleIds.filter((id) => id !== roleId)
      : [...user.roleIds, roleId];
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      await setUserRoles(token, user.uid, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update roles failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleGroup = async (group: AdminGroup) => {
    if (!user || group.system) return;
    const next = user.groupIds.includes(group.id)
      ? user.groupIds.filter((id) => id !== group.id)
      : [...user.groupIds, group.id];
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      await setUserGroups(token, user.uid, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update groups failed");
    } finally {
      setBusy(false);
    }
  };

  if (!user && !error) {
    return <p className="home-page__status">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="admin-tab">
        <p className="home-page__error">{error}</p>
        <Button type="button" variant="secondary" onClick={() => navigate("/admin/users")}>
          Back to users
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-tab">
      <p>
        <Link to="/admin/users">← Users</Link>
      </p>
      <h2 className="admin-detail__title">{user.email}</h2>
      <Text variant="muted">
        Status: {user.status}
        {user.status === "pending" ? " · awaiting first sign-in" : ""}
      </Text>
      {error && <p className="home-page__error">{error}</p>}

      <div className="admin-detail">
        <fieldset className="admin-fieldset" disabled={busy}>
          <legend>Roles</legend>
          {roles.map((role) => (
            <label key={role.id} className="admin-check">
              <input
                type="checkbox"
                checked={user.roleIds.includes(role.id)}
                onChange={() => void toggleRole(role.id)}
              />
              {role.name} <span className="admin-list__meta">({role.id})</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="admin-fieldset" disabled={busy}>
          <legend>Groups</legend>
          {groups.map((group) => (
            <label key={group.id} className="admin-check">
              <input
                type="checkbox"
                checked={user.groupIds.includes(group.id)}
                disabled={group.system}
                onChange={() => void toggleGroup(group)}
              />
              {group.name} <span className="admin-list__meta">({group.id})</span>
              {group.description ? ` — ${group.description}` : ""}
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
