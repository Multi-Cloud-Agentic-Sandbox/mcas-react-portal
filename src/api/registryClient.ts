import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@mcas/auth-client";
import { registryUrl } from "../config/env";
import type { ToolRegistryEntry } from "../types/tool";

function bearerHeaders(token?: string | null, extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export interface UseToolsRegistryOptions {
  /**
   * When true, GET /tools?enrich=true (blocking manifest fetch).
   * When false (default), list DB rows instantly then resolve each via GET /tools/{id}.
   */
  enrich?: boolean;
}

export function useToolsRegistry(options: UseToolsRegistryOptions = {}) {
  const { enrich = false } = options;
  const { ensureMcasToken } = useAuth();
  const [tools, setTools] = useState<ToolRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      const qs = enrich ? "?enrich=true" : "";
      const response = await fetch(`${registryUrl}/tools${qs}`, {
        headers: bearerHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Registry error: ${response.status}`);
      }
      const data = (await response.json()) as ToolRegistryEntry[];

      if (enrich) {
        setTools(data);
        return;
      }

      // Instant DB list, then resolve manifests in parallel.
      setTools(data.map((tool) => ({ ...tool, status: "loading" as const })));
      setLoading(false);

      await Promise.all(
        data.map(async (tool) => {
          try {
            const resolved = await fetch(`${registryUrl}/tools/${tool.id}`, {
              headers: bearerHeaders(token),
            });
            if (!resolved.ok) {
              throw new Error(`Resolve failed: ${resolved.status}`);
            }
            const entry = (await resolved.json()) as ToolRegistryEntry;
            setTools((prev) => prev.map((row) => (row.id === entry.id ? entry : row)));
          } catch {
            setTools((prev) =>
              prev.map((row) =>
                row.id === tool.id ? { ...row, status: "unreachable" } : row,
              ),
            );
          }
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [enrich, ensureMcasToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { tools, loading, error, reload };
}

export async function listTools(token?: string | null): Promise<ToolRegistryEntry[]> {
  const response = await fetch(`${registryUrl}/tools?enrich=true`, {
    headers: bearerHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`Registry error: ${response.status}`);
  }
  return (await response.json()) as ToolRegistryEntry[];
}

export async function importToolFromManifest(
  manifestUrl: string,
  token?: string | null,
): Promise<ToolRegistryEntry> {
  const response = await fetch(`${registryUrl}/tools/import`, {
    method: "POST",
    headers: bearerHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ manifestUrl }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Import failed: ${response.status}`);
  }
  return (await response.json()) as ToolRegistryEntry;
}

export async function syncToolFromManifest(
  toolId: string,
  token?: string | null,
): Promise<ToolRegistryEntry> {
  const response = await fetch(`${registryUrl}/tools/${toolId}/sync`, {
    method: "POST",
    headers: bearerHeaders(token),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Sync failed: ${response.status}`);
  }
  return (await response.json()) as ToolRegistryEntry;
}

export async function deleteTool(id: string, token?: string | null): Promise<void> {
  const response = await fetch(`${registryUrl}/tools/${id}`, {
    method: "DELETE",
    headers: bearerHeaders(token),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Delete failed: ${response.status}`);
  }
}
