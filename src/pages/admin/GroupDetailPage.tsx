import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import { Button, Text } from "@mcas/design-system";
import {
  getGroup,
  listRoles,
  setGroupRoles,
  type AdminGroup,
  type AdminRole,
} from "../../api/authAdminClient";

export function GroupDetailPage() {
  const { groupId = "" } = useParams();
  const { ensureMcasToken } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<AdminGroup | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const token = await ensureMcasToken();
    const [g, r] = await Promise.all([getGroup(token, groupId), listRoles(token)]);
    setGroup(g);
    setRoles(r);
  };

  useEffect(() => {
    if (!groupId) return;
    void reload().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load group");
      setGroup(null);
    });
  }, [groupId]);

  const toggleRole = async (roleId: string) => {
    if (!group) return;
    const next = group.roleIds.includes(roleId)
      ? group.roleIds.filter((id) => id !== roleId)
      : [...group.roleIds, roleId];
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      await setGroupRoles(token, group.id, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!group && !error) return <p className="home-page__status">Loading…</p>;
  if (!group) {
    return (
      <div className="admin-tab">
        <p className="home-page__error">{error}</p>
        <Button type="button" variant="secondary" onClick={() => navigate("/admin/groups")}>
          Back to groups
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-tab">
      <p>
        <Link to="/admin/groups">← Groups</Link>
      </p>
      <h2 className="admin-detail__title">{group.name}</h2>
      <Text variant="muted">
        Id: <code className="admin-id">{group.id}</code>
        {group.description ? ` — ${group.description}` : ""}
        {group.system ? " · system" : ""}
      </Text>
      {error && <p className="home-page__error">{error}</p>}

      <div className="admin-detail">
        <fieldset className="admin-fieldset" disabled={busy}>
          <legend>Roles</legend>
          {roles.map((role) => (
            <label key={role.id} className="admin-check">
              <input
                type="checkbox"
                checked={group.roleIds.includes(role.id)}
                onChange={() => void toggleRole(role.id)}
              />
              {role.name} <span className="admin-list__meta">({role.id})</span>
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
