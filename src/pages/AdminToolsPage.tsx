import { useState } from "react";
import { useAuth } from "@mcas/auth-client";
import { Badge, Button, DataTable, Input, Text, type CrudAction } from "@mcas/design-system";
import {
  deleteTool,
  importToolFromManifest,
  syncToolFromManifest,
  useToolsRegistry,
} from "../api/registryClient";
import type { ToolRegistryEntry } from "../types/tool";

const emptyManifestUrl = "";

export function AdminToolsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const { ensureMcasToken } = useAuth();
  const { tools, loading, error, reload } = useToolsRegistry({
    enrich: false,
  });
  const [manifestUrl, setManifestUrl] = useState(emptyManifestUrl);
  const [preview, setPreview] = useState<ToolRegistryEntry | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setSubmitError(null);
    setPreview(null);
    try {
      const token = await ensureMcasToken();
      const entry = await importToolFromManifest(manifestUrl.trim(), token);
      setPreview(entry);
      setManifestUrl("");
      setShowImport(false);
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async (toolId: string) => {
    setBusy(true);
    setSubmitError(null);
    try {
      const token = await ensureMcasToken();
      await syncToolFromManifest(toolId, token);
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  };

  const onRowAction = async (action: CrudAction, row: ToolRegistryEntry) => {
    if (action !== "delete") return;
    setBusy(true);
    setSubmitError(null);
    try {
      const token = await ensureMcasToken();
      await deleteTool(row.id, token);
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={embedded ? "admin-tab" : "admin-page"}>
      {!embedded && <h1 className="admin-page__title">Tool registry admin</h1>}
      <Text variant="muted">
        Register tools from each remote&apos;s <code>tool.manifest.json</code>. Routes, scope,
        exposes and access rights are loaded from the manifest.
      </Text>

      {showImport && (
        <form className="admin-form" onSubmit={(e) => void handleImport(e)}>
          <div className="admin-form__row">
            <label className="admin-form__label" htmlFor="tool-manifest">
              Manifest URL
            </label>
            <Input
              id="tool-manifest"
              value={manifestUrl}
              onChange={(e) => setManifestUrl(e.target.value)}
              placeholder="http://localhost:5175/tool.manifest.json"
              required
            />
          </div>
          {submitError && <Text variant="small">{submitError}</Text>}
          <div className="admin-form__actions">
            <Button type="submit" disabled={busy}>
              Register from manifest
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {preview && (
        <section className="admin-preview">
          <h2>Last import</h2>
          <div className="admin-preview__grid">
            <div>
              <strong>{preview.label}</strong>
              <div className="admin-list__meta">{preview.id}</div>
              <div className="admin-list__meta">{preview.remoteEntry}</div>
              <div className="admin-list__meta">{preview.basePath}</div>
              <div className="admin-list__meta">
                Routes: {preview.routes.map((route) => route.label).join(", ")}
              </div>
            </div>
          </div>
        </section>
      )}

      {loading && <p className="home-page__status">Loading…</p>}
      {error && <p className="home-page__error">{error}</p>}
      {!showImport && submitError && <p className="home-page__error">{submitError}</p>}

      <DataTable
        aria-label="Registered tools"
        searchPlaceholder="Search tools…"
        getRowId={(row) => row.id}
        rows={tools}
        columns={[
          {
            id: "label",
            header: "Label",
            cell: (row) => row.label,
            getValue: (row) => row.label,
          },
          {
            id: "id",
            header: "Id",
            cell: (row) => row.id,
            getValue: (row) => row.id,
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => (
              <Badge
                variant={
                  row.status === "unreachable"
                    ? "danger"
                    : row.status === "loading"
                      ? "primary"
                      : undefined
                }
              >
                {row.status}
              </Badge>
            ),
            getValue: (row) => row.status,
            filterable: true,
          },
          {
            id: "basePath",
            header: "Base path",
            cell: (row) => row.basePath,
            getValue: (row) => row.basePath,
          },
          {
            id: "routes",
            header: "Routes",
            cell: (row) => row.routes.map((r) => r.label).join(", ") || "—",
            getValue: (row) => row.routes.map((r) => r.label).join(" "),
          },
          {
            id: "sync",
            header: "Sync",
            cell: (row) => (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void handleSync(row.id)}
              >
                Sync
              </Button>
            ),
            getValue: () => "",
          },
        ]}
        rowActions={["delete"]}
        onRowAction={(action, row) => void onRowAction(action, row)}
        onCreate={() => {
          setShowImport(true);
          setSubmitError(null);
        }}
        createLabel="Register tool"
        emptyMessage="No tools registered"
      />
    </div>
  );
}
