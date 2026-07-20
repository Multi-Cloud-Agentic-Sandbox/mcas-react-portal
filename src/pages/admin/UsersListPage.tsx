import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import { Badge, Button, DataTable, Input, Text, type CrudAction } from "@mcas/design-system";
import {
  createUser,
  listRoles,
  listUsers,
  type AdminRole,
  type AdminUser,
} from "../../api/authAdminClient";

export function UsersListPage() {
  const { ensureMcasToken } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [email, setEmail] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const roleNameById = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  );

  const formatRoleNames = (roleIds: string[]) =>
    roleIds.map((id) => roleNameById.get(id) ?? id).join(", ") || "—";

  const reload = async () => {
    const token = await ensureMcasToken();
    const [nextUsers, nextRoles] = await Promise.all([
      listUsers(token),
      listRoles(token),
    ]);
    setUsers(nextUsers);
    setRoles(nextRoles);
  };

  useEffect(() => {
    void reload().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load users"),
    );
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      const created = await createUser(token, { email });
      setEmail("");
      setShowCreate(false);
      await reload();
      navigate(`/admin/users/${created.uid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const onRowAction = (action: CrudAction, row: AdminUser) => {
    if (action === "update" || action === "read") {
      navigate(`/admin/users/${row.uid}`);
    }
  };

  return (
    <div className="admin-tab">
      <Text variant="muted">Manage pending and active users. Edit opens the detail page.</Text>
      {error && <p className="home-page__error">{error}</p>}

      {showCreate && (
        <form className="admin-form" onSubmit={(e) => void handleCreate(e)}>
          <div className="admin-form__row">
            <label className="admin-form__label" htmlFor="pending-email">
              Email
            </label>
            <Input
              id="pending-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-form__actions">
            <Button type="submit" disabled={busy}>
              Add pending user
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <DataTable
        aria-label="Users"
        searchPlaceholder="Search users…"
        getRowId={(row) => row.uid}
        rows={users}
        columns={[
          {
            id: "email",
            header: "Email",
            cell: (row) => row.email,
            getValue: (row) => row.email,
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => <Badge>{row.status}</Badge>,
            getValue: (row) => row.status,
            filterable: true,
          },
          {
            id: "roles",
            header: "Roles",
            cell: (row) => formatRoleNames(row.roleIds),
            getValue: (row) => formatRoleNames(row.roleIds),
          },
        ]}
        rowActions={["update"]}
        onRowAction={onRowAction}
        onCreate={() => setShowCreate(true)}
        createLabel="Add user"
        emptyMessage="No users yet"
      />
    </div>
  );
}
