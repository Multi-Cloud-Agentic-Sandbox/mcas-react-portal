import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "portal",
      manifest: true,
      remotes: {},
      shared: {
        react: { singleton: true, requiredVersion: "^18.3.1" },
        "react/": { singleton: true, requiredVersion: "^18.3.1" },
        "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
        "react-dom/": { singleton: true, requiredVersion: "^18.3.1" },
        "react-router-dom": { singleton: true, requiredVersion: "^7.6.2" },
        "@mcas/auth-client": { singleton: true, requiredVersion: "^0.1.0" },
      },
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
