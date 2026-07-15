import { getInstance, loadRemote, registerRemotes } from "@module-federation/runtime";
import type { ToolRegistryEntry } from "../types/tool";

const registeredScopes = new Set<string>();

function ensureFederationReady(): void {
  if (!getInstance()) {
    throw new Error(
      "Module Federation runtime is not initialized. Ensure @module-federation/vite is active.",
    );
  }
}

function registerRemote(tool: ToolRegistryEntry): void {
  ensureFederationReady();
  const remote = {
    name: tool.scope,
    entry: tool.remoteEntry,
    type: "module" as const,
  };

  if (registeredScopes.has(tool.scope)) {
    registerRemotes([remote], { force: true });
    return;
  }

  registerRemotes([remote]);
  registeredScopes.add(tool.scope);
}

function exposePath(expose: string): string {
  return expose.replace(/^\.\//, "");
}

export async function loadToolModule<T>(
  tool: ToolRegistryEntry,
  kind: "card" | "app",
): Promise<T> {
  registerRemote(tool);
  const expose = kind === "card" ? tool.exposes.card : tool.exposes.app;
  const modulePath = `${tool.scope}/${exposePath(expose)}`;
  const remoteModule = (await loadRemote(modulePath)) as { default: T };
  return remoteModule.default;
}
