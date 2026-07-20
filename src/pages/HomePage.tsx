import { HasRight, useAuth } from "@mcas/auth-client";
import { useToolsRegistry } from "../api/registryClient";
import { ToolCardSlot } from "../components/ToolCardSlot";
import type { ToolRegistryEntry } from "../types/tool";

function UnreachableToolCard({ tool }: { tool: ToolRegistryEntry }) {
  return (
    <div className="tool-card-slot tool-card-slot--unavailable" role="status">
      <h2 className="tool-card-slot__title">{tool.label}</h2>
      <p className="tool-card-slot__message">
        This tool is temporarily unavailable.
      </p>
    </div>
  );
}

export function HomePage() {
  const { tools, loading, error } = useToolsRegistry();
  const { getMcasToken, user } = useAuth();
  const token = getMcasToken();

  const visibleTools = tools.filter((tool) => {
    if (tool.status === "loading") return false;
    if (tool.status === "unreachable") return true;
    return HasRight(user ?? token, tool.accessRight);
  });

  const stillResolving = tools.some((tool) => tool.status === "loading");

  return (
    <div className="home-page">
      <h1 className="home-page__title">Business tools</h1>
      <p className="home-page__intro">
        Select a tool below. Cards are loaded dynamically from each tool remote.
      </p>

      {error && <p className="home-page__error">{error}</p>}
      {(loading || stillResolving) && visibleTools.length === 0 && (
        <p className="home-page__status">Loading registry…</p>
      )}

      {!loading && !error && !stillResolving && visibleTools.length === 0 && (
        <p className="home-page__status">No tools available for your account.</p>
      )}

      <div className="home-page__grid">
        {visibleTools.map((tool) =>
          tool.status === "unreachable" ? (
            <UnreachableToolCard key={tool.id} tool={tool} />
          ) : (
            <ToolCardSlot key={tool.id} tool={tool} />
          ),
        )}
      </div>
    </div>
  );
}
