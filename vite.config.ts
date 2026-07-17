import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

/** Host provides React singletons; remotes use import:false. Do not share @mcas/auth-client. */
const sharedSingletons = {
  react: { singleton: true, requiredVersion: "^18.3.1", eager: true },
  "react/": { singleton: true, requiredVersion: "^18.3.1", eager: true },
  "react-dom": { singleton: true, requiredVersion: "^18.3.1", eager: true },
  "react-dom/": { singleton: true, requiredVersion: "^18.3.1", eager: true },
  "react-router-dom": { singleton: true, requiredVersion: "^7.6.2", eager: true },
} as const;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "portal",
      manifest: true,
      remotes: {},
      shared: sharedSingletons,
    }),
  ],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    origin: "http://localhost:5173",
  },
  build: {
    target: "chrome89",
  },
});
