import { useState } from "react";
import { useAuth } from "@mcas/auth-client";
import { Button, Input, Text } from "@mcas/design-system";
import {
  deleteTool,
  importToolFromManifest,
  syncToolFromManifest,
  useToolsRegistry,
} from "../api/registryClient";
import type { ToolRegistryEntry } from "../types/tool";

const emptyManifestUrl = "";

export function AdminToolsPage() {
  const { ensureMcasToken } = useAuth();
  const { tools, loading, error, reload } = useToolsRegistry({ activeOnly: false });
  const [manifestUrl, setManifestUrl] = useState(emptyManifestUrl);
  const [preview, setPreview] = useState<ToolRegistryEntry | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const handleDelete = async (id: string) => {
    setBusy(true);
    setSubmitError(null);
    try {
      const token = await ensureMcasToken();
      await deleteTool(id, token);
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Tool registry admin</h1>
      <Text variant="muted">
        Register tools from each remote&apos;s <code>tool.manifest.json</code>. Routes, scope,
        exposes and access rights are loaded from the manifest.
      </Text>

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
        </div>
      </form>

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

      <h2>Registered tools</h2>
      {loading && <p className="home-page__status">Loading…</p>}
      {error && <p className="home-page__error">{error}</p>}
      <div className="admin-list">
        {tools.map((tool) => (
          <div key={tool.id} className="admin-list__item">
            <div>
              <strong>{tool.label}</strong>
              <div className="admin-list__meta">{tool.id}</div>
              <div className="admin-list__meta">Status: {tool.status}</div>
              <div className="admin-list__meta">{tool.remoteEntry}</div>
              <div className="admin-list__meta">{tool.basePath}</div>
              <div className="admin-list__meta">
                Routes:{" "}
                {tool.routes.map((route) => (
                  <span key={route.path} className="admin-list__route">
                    {route.label} ({route.path})
                  </span>
                ))}
              </div>
            </div>
            <div className="admin-list__actions">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => void handleSync(tool.id)}
              >
                Sync manifest
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => void handleDelete(tool.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
