import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToolsRegistry } from "../api/registryClient";
import { loadToolModule } from "../federation/loadRemoteTool";
import type { RemoteAppProps } from "../types/tool";

export function DynamicToolHost() {
  const { toolId } = useParams<{ toolId: string }>();
  const { tools, loading, error } = useToolsRegistry();
  const [RemoteApp, setRemoteApp] = useState<React.ComponentType<RemoteAppProps> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(false);

  const tool = tools.find((entry) => entry.id === toolId);

  useEffect(() => {
    if (!tool) {
      setRemoteApp(null);
      return;
    }

    let cancelled = false;
    setAppLoading(true);
    setLoadError(null);

    void (async () => {
      try {
        const App = await loadToolModule<React.ComponentType<RemoteAppProps>>(tool, "app");
        if (!cancelled) {
          setRemoteApp(() => App);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load tool");
          setRemoteApp(null);
        }
      } finally {
        if (!cancelled) {
          setAppLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tool]);

  if (loading) {
    return <div className="tool-host home-page__status">Loading registry…</div>;
  }

  if (error) {
    return <div className="tool-host tool-host--error">{error}</div>;
  }

  if (!tool) {
    return <div className="tool-host tool-host--error">Tool &quot;{toolId}&quot; not found.</div>;
  }

  if (appLoading) {
    return <div className="tool-host home-page__status">Loading {tool.label}…</div>;
  }

  if (loadError || !RemoteApp) {
    return (
      <div className="tool-host tool-host--error">
        {tool.label}: {loadError ?? "Remote app unavailable"}
      </div>
    );
  }

  return (
    <div className="tool-host">
      <RemoteApp basePath={tool.basePath} />
    </div>
  );
}
