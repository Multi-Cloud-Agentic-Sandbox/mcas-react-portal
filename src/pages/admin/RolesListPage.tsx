import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import { Badge, Button, DataTable, Input, Text, type CrudAction } from "@mcas/design-system";
import { createRole, deleteRole, listRoles, type AdminRole } from "../../api/authAdminClient";

export function RolesListPage() {
  const { ensureMcasToken } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const token = await ensureMcasToken();
    setRoles(await listRoles(token));
  };

  useEffect(() => {
    void reload().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load roles"),
    );
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      const created = await createRole(token, { name: name.trim() });
      setShowCreate(false);
      setName("");
      await reload();
      navigate(`/admin/roles/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const onRowAction = async (action: CrudAction, row: AdminRole) => {
    if (action === "update" || action === "read") {
      navigate(`/admin/roles/${row.id}`);
      return;
    }
    if (action === "delete") {
      if (row.system) return;
      setBusy(true);
      setError(null);
      try {
        const token = await ensureMcasToken();
        await deleteRole(token, row.id);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <div className="admin-tab">
      <Text variant="muted">Ids are generated as UUIDs. Assign rights on the role detail page.</Text>
      {error && <p className="home-page__error">{error}</p>}

      {showCreate && (
        <form className="admin-form" onSubmit={(e) => void handleCreate(e)}>
          <div className="admin-form__row">
            <label className="admin-form__label" htmlFor="role-name">
              Name
            </label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="admin-form__actions">
            <Button type="submit" disabled={busy}>
              Create role
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <DataTable
        aria-label="Roles"
        searchPlaceholder="Search roles…"
        getRowId={(row) => row.id}
        rows={roles}
        columns={[
          {
            id: "name",
            header: "Name",
            cell: (row) => row.name,
            getValue: (row) => row.name,
          },
          {
            id: "id",
            header: "Id",
            cell: (row) => <code className="admin-id">{row.id}</code>,
            getValue: (row) => row.id,
          },
          {
            id: "rights",
            header: "Rights",
            cell: (row) => row.rightIds.length,
            getValue: (row) => String(row.rightIds.length),
          },
          {
            id: "system",
            header: "Type",
            cell: (row) => (row.system ? <Badge variant="primary">system</Badge> : "custom"),
            getValue: (row) => (row.system ? "system" : "custom"),
            filterable: true,
          },
        ]}
        rowActions={(row) => (row.system ? ["update"] : ["update", "delete"])}
        onRowAction={(action, row) => void onRowAction(action, row)}
        onCreate={() => setShowCreate(true)}
        createLabel="Add role"
        emptyMessage="No roles"
      />
    </div>
  );
}
