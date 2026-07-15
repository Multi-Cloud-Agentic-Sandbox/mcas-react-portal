import { HasRight, useAuth } from "@mcas/auth-client";
import { useToolsRegistry } from "../api/registryClient";
import { ToolCardSlot } from "../components/ToolCardSlot";

export function HomePage() {
  const { tools, loading, error } = useToolsRegistry();
  const { getMcasToken } = useAuth();
  const token = getMcasToken();

  const visibleTools = tools.filter((tool) => HasRight(token, tool.accessRight));

  return (
    <div className="home-page">
      <h1 className="home-page__title">Business tools</h1>
      <p className="home-page__intro">
        Select a tool below. Cards are loaded dynamically from each tool remote.
      </p>

      {error && <p className="home-page__error">{error}</p>}
      {loading && <p className="home-page__status">Loading registry…</p>}

      {!loading && !error && visibleTools.length === 0 && (
        <p className="home-page__status">No tools available for your account.</p>
      )}

      <div className="home-page__grid">
        {visibleTools.map((tool) => (
          <ToolCardSlot key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
