import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@mcas/auth-client";
import { Badge, Button, DataTable, Input, Text, type CrudAction } from "@mcas/design-system";
import {
  createGroup,
  deleteGroup,
  listGroups,
  type AdminGroup,
} from "../../api/authAdminClient";

export function GroupsListPage() {
  const { ensureMcasToken } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const token = await ensureMcasToken();
    setGroups(await listGroups(token));
  };

  useEffect(() => {
    void reload().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load groups"),
    );
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      const created = await createGroup(token, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setShowCreate(false);
      setName("");
      setDescription("");
      await reload();
      navigate(`/admin/groups/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const onRowAction = async (action: CrudAction, row: AdminGroup) => {
    if (action === "update" || action === "read") {
      navigate(`/admin/groups/${row.id}`);
      return;
    }
    if (action === "delete") {
      if (row.system) return;
      setBusy(true);
      setError(null);
      try {
        const token = await ensureMcasToken();
        await deleteGroup(token, row.id);
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
      <Text variant="muted">
        Ids are generated as UUIDs. Assign roles on the group detail page. System group All is
        protected.
      </Text>
      {error && <p className="home-page__error">{error}</p>}

      {showCreate && (
        <form className="admin-form" onSubmit={(e) => void handleCreate(e)}>
          <div className="admin-form__row">
            <label className="admin-form__label" htmlFor="group-name">
              Name
            </label>
            <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label" htmlFor="group-desc">
              Description
            </label>
            <Input
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="admin-form__actions">
            <Button type="submit" disabled={busy}>
              Create group
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <DataTable
        aria-label="Groups"
        searchPlaceholder="Search groups…"
        getRowId={(row) => row.id}
        rows={groups}
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
            id: "description",
            header: "Description",
            cell: (row) => row.description ?? "—",
            getValue: (row) => row.description ?? "",
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
        createLabel="Add group"
        emptyMessage="No groups"
      />
    </div>
  );
}
