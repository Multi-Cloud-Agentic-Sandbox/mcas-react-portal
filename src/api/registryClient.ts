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
  /** When true (default), only tools with status === "active" are returned. */
  activeOnly?: boolean;
}

export function useToolsRegistry(options: UseToolsRegistryOptions = {}) {
  const { activeOnly = true } = options;
  const { ensureMcasToken } = useAuth();
  const [tools, setTools] = useState<ToolRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await ensureMcasToken();
      const response = await fetch(`${registryUrl}/tools`, {
        headers: bearerHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Registry error: ${response.status}`);
      }
      const data = (await response.json()) as ToolRegistryEntry[];
      setTools(activeOnly ? data.filter((tool) => tool.status === "active") : data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, ensureMcasToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { tools, loading, error, reload };
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
