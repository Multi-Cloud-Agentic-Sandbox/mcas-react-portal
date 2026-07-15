import { useEffect, useState } from "react";
import { registryUrl } from "../config/env";
import type { ToolRegistryEntry } from "../types/tool";

export function useToolsRegistry() {
  const [tools, setTools] = useState<ToolRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${registryUrl}/tools`);
      if (!response.ok) {
        throw new Error(`Registry error: ${response.status}`);
      }
      const data = (await response.json()) as ToolRegistryEntry[];
      setTools(data.filter((tool) => tool.status === "active"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { tools, loading, error, reload };
}

export async function createTool(entry: ToolRegistryEntry): Promise<void> {
  const response = await fetch(`${registryUrl}/tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Create failed: ${response.status}`);
  }
}

export async function importToolFromManifest(manifestUrl: string): Promise<ToolRegistryEntry> {
  const response = await fetch(`${registryUrl}/tools/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manifestUrl }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Import failed: ${response.status}`);
  }
  return (await response.json()) as ToolRegistryEntry;
}

export async function syncToolFromManifest(toolId: string): Promise<ToolRegistryEntry> {
  const response = await fetch(`${registryUrl}/tools/${toolId}/sync`, {
    method: "POST",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Sync failed: ${response.status}`);
  }
  return (await response.json()) as ToolRegistryEntry;
}

export async function updateTool(id: string, entry: Partial<ToolRegistryEntry>): Promise<void> {
  const response = await fetch(`${registryUrl}/tools/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Update failed: ${response.status}`);
  }
}

export async function deleteTool(id: string): Promise<void> {
  const response = await fetch(`${registryUrl}/tools/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Delete failed: ${response.status}`);
  }
}
