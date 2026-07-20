import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import { Button, Text } from "@mcas/design-system";
import {
  getRole,
  listRights,
  setRoleRights,
  upsertRightsCatalog,
  type AdminRight,
  type AdminRole,
} from "../../api/authAdminClient";
import { listTools } from "../../api/registryClient";
import type { ToolRegistryEntry } from "../../types/tool";

function catalogItemsForTool(tool: ToolRegistryEntry) {
  const byId = new Map<string, { id: string; label?: string; description?: string }>();
  byId.set(tool.accessRight, {
    id: tool.accessRight,
    label: `Access ${tool.label}`,
    description: `Open ${tool.label} in the portal`,
  });
  for (const right of tool.rights ?? []) {
    if (byId.has(right.id)) continue;
    byId.set(right.id, {
      id: right.id,
      label: right.description?.trim() || right.id,
      description: right.description ?? undefined,
    });
  }
  return [...byId.values()];
}

async function ensureToolRightsInCatalog(token: string | null) {
  try {
    const tools = await listTools(token);
    await Promise.all(
      tools.map((tool) => upsertRightsCatalog(token, tool.id, catalogItemsForTool(tool))),
    );
  } catch {
    // Optional: user may lack registries.manage, or registry may be down.
  }
}

export function RoleDetailPage() {
  const { roleId = "" } = useParams();
  const { ensureMcasToken } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [rights, setRights] = useState<AdminRight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const byOrigin = useMemo(() => {
    const map = new Map<string, AdminRight[]>();
    for (const right of rights) {
      const key = right.origin.startsWith("portal") ? "portal" : right.origin;
      const list = map.get(key) ?? [];
      list.push(right);
      map.set(key, list);
    }
    const portal = map.get("portal") ?? [];
    map.delete("portal");
    const rest = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return [["portal", portal] as const, ...rest];
  }, [rights]);

  const reload = async () => {
    const token = await ensureMcasToken();
    await ensureToolRightsInCatalog(token);
    const [r, rightsList] = await Promise.all([getRole(token, roleId), listRights(token)]);
    setRole(r);
    setRights(rightsList);
  };

  useEffect(() => {
    if (!roleId) return;
    void reload().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load role");
      setRole(null);
    });
  }, [roleId]);

  const toggleRight = async (rightId: string) => {
    if (!role) return;
    const next = role.rightIds.includes(rightId)
      ? role.rightIds.filter((id) => id !== rightId)
      : [...role.rightIds, rightId];
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      await setRoleRights(token, role.id, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!role && !error) return <p className="home-page__status">Loading…</p>;
  if (!role) {
    return (
      <div className="admin-tab">
        <p className="home-page__error">{error}</p>
        <Button type="button" variant="secondary" onClick={() => navigate("/admin/roles")}>
          Back to roles
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-tab">
      <p>
        <Link to="/admin/roles">← Roles</Link>
      </p>
      <h2 className="admin-detail__title">{role.name}</h2>
      <Text variant="muted">
        Id: <code className="admin-id">{role.id}</code>
        {role.system ? " · system" : ""}
      </Text>
      {error && <p className="home-page__error">{error}</p>}

      <div className="admin-detail">
        <fieldset className="admin-fieldset" disabled={busy}>
          <legend>Rights</legend>
          {byOrigin.map(([origin, originRights]) =>
            originRights.length === 0 ? null : (
              <div key={origin} className="admin-rights-group">
                <h4 className="admin-rights-group__title">{origin}</h4>
                {originRights.map((right) => (
                  <label key={right.id} className="admin-check">
                    <input
                      type="checkbox"
                      checked={role.rightIds.includes(right.id)}
                      onChange={() => void toggleRight(right.id)}
                    />
                    <span>
                      {right.label}{" "}
                      <span className="admin-list__meta">({right.id})</span>
                      {right.description ? (
                        <div className="admin-list__meta">{right.description}</div>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            ),
          )}
        </fieldset>
      </div>
    </div>
  );
}
