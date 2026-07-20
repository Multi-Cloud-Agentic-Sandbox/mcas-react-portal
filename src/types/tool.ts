export interface ToolRightDecl {
  id: string;
  description?: string | null;
}

export interface ToolRoute {
  path: string;
  label: string;
}

export interface ToolExposes {
  card: string;
  app: string;
}

export interface ToolRegistryEntry {
  id: string;
  label: string;
  accessRight: string;
  rights?: ToolRightDecl[];
  remoteEntry: string;
  scope: string;
  exposes: ToolExposes;
  basePath: string;
  routes: ToolRoute[];
  /** Ephemeral: loading | active | unreachable — never stored in the registry DB. */
  status: "loading" | "active" | "unreachable" | string;
}

export interface ToolCardProps {
  tool: ToolRegistryEntry;
  routes: ToolRoute[];
  basePath: string;
}

export interface RemoteAppProps {
  basePath: string;
}
