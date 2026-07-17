import { Route, Routes } from "react-router-dom";
import {
  AgentProgressPage,
  ComponentsShowcasePage,
  TokensPage,
} from "@mcas/design-system/showcase";
import { AppShell, Footer } from "@mcas/design-system/layout";
import { RequireAuth } from "./auth/RequireAuth";
import { PortalHeader } from "./layout/PortalHeader";
import { AdminToolsPage } from "./pages/AdminToolsPage";
import { AuthPage } from "./pages/AuthPage";
import { DynamicToolHost } from "./pages/DynamicToolHost";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import "./layout/portal.css";

export default function App() {
  return (
    <AppShell
      header={<PortalHeader />}
      footer={<Footer productName="MCAS Portal v0.1.0" tagline="Micro-frontend sandbox" />}
    >
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/tools/:toolId/*"
          element={
            <RequireAuth>
              <DynamicToolHost />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/tools"
          element={
            <RequireAuth>
              <AdminToolsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/design-system/tokens"
          element={
            <RequireAuth>
              <TokensPage />
            </RequireAuth>
          }
        />
        <Route
          path="/design-system/components"
          element={
            <RequireAuth>
              <ComponentsShowcasePage />
            </RequireAuth>
          }
        />
        <Route
          path="/design-system/agent-progress"
          element={
            <RequireAuth>
              <AgentProgressPage />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <NotFoundPage />
            </RequireAuth>
          }
        />
      </Routes>
    </AppShell>
  );
}
