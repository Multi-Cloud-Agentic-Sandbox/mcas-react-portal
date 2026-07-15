import { Route, Routes } from "react-router-dom";
import {
  AgentProgressPage,
  ComponentsShowcasePage,
  TokensPage,
} from "@mcas/design-system/showcase";
import { AppShell, Footer } from "@mcas/design-system/layout";
import { PortalHeader } from "./layout/PortalHeader";
import { AdminToolsPage } from "./pages/AdminToolsPage";
import { DynamicToolHost } from "./pages/DynamicToolHost";
import { HomePage } from "./pages/HomePage";
import "./layout/portal.css";

export default function App() {
  return (
    <AppShell header={<PortalHeader />} footer={<Footer />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/:toolId/*" element={<DynamicToolHost />} />
        <Route path="/admin/tools" element={<AdminToolsPage />} />
        <Route path="/design-system/tokens" element={<TokensPage />} />
        <Route path="/design-system/components" element={<ComponentsShowcasePage />} />
        <Route path="/design-system/agent-progress" element={<AgentProgressPage />} />
      </Routes>
    </AppShell>
  );
}
