import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import { loadToolModule } from "../federation/loadRemoteTool";
import type { ToolCardProps, ToolRegistryEntry } from "../types/tool";

interface ToolCardSlotProps {
  tool: ToolRegistryEntry;
}

interface ToolCardSlotState {
  Card: React.ComponentType<ToolCardProps> | null;
  error: string | null;
  loading: boolean;
}

export class ToolCardErrorBoundary extends Component<
  { children: ReactNode; toolLabel: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ToolCard render failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tool-card-slot tool-card-slot--error">
          Failed to render card for {this.props.toolLabel}
        </div>
      );
    }
    return this.props.children;
  }
}

export function ToolCardSlot({ tool }: ToolCardSlotProps) {
  const [state, setState] = useState<ToolCardSlotState>({
    Card: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ Card: null, error: null, loading: true });

    void (async () => {
      try {
        const Card = await loadToolModule<React.ComponentType<ToolCardProps>>(tool, "card");
        if (!cancelled) {
          setState({ Card, error: null, loading: false });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            Card: null,
            error: err instanceof Error ? err.message : "Failed to load remote card",
            loading: false,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tool.id, tool.remoteEntry]);

  if (state.loading) {
    return <div className="tool-card-slot home-page__status">Loading {tool.label}…</div>;
  }

  if (state.error || !state.Card) {
    return (
      <div className="tool-card-slot tool-card-slot--error">
        {tool.label}: {state.error ?? "Card unavailable"}
      </div>
    );
  }

  const Card = state.Card;
  return (
    <ToolCardErrorBoundary toolLabel={tool.label}>
      <Card tool={tool} routes={tool.routes} basePath={tool.basePath} />
    </ToolCardErrorBoundary>
  );
}
