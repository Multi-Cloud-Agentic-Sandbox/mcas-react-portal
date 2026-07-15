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
  remoteEntry: string;
  scope: string;
  exposes: ToolExposes;
  basePath: string;
  routes: ToolRoute[];
  status: string;
}

export interface ToolCardProps {
  tool: ToolRegistryEntry;
  routes: ToolRoute[];
  basePath: string;
}

export interface RemoteAppProps {
  basePath: string;
}
