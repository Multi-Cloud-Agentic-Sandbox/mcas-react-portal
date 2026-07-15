export const registryUrl =
  (import.meta.env.VITE_REGISTRY_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8090";
