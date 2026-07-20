import { Route, Routes } from "react-router-dom";
import { AppShell, Footer } from "@mcas/design-system/layout";
import { RequireAuth } from "./auth/RequireAuth";
import { PortalHeader } from "./layout/PortalHeader";
import { AdminIndexRedirect, AdminLayout } from "./pages/AdminLayout";
import { AdminToolsPage } from "./pages/AdminToolsPage";
import { AuthPage } from "./pages/AuthPage";
import { DynamicToolHost } from "./pages/DynamicToolHost";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { GroupDetailPage } from "./pages/admin/GroupDetailPage";
import { GroupsListPage } from "./pages/admin/GroupsListPage";
import { RoleDetailPage } from "./pages/admin/RoleDetailPage";
import { RolesListPage } from "./pages/admin/RolesListPage";
import { UserDetailPage } from "./pages/admin/UserDetailPage";
import { UsersListPage } from "./pages/admin/UsersListPage";
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
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminIndexRedirect />} />
          <Route path="tools" element={<AdminToolsPage embedded />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/:uid" element={<UserDetailPage />} />
          <Route path="groups" element={<GroupsListPage />} />
          <Route path="groups/:groupId" element={<GroupDetailPage />} />
          <Route path="roles" element={<RolesListPage />} />
          <Route path="roles/:roleId" element={<RoleDetailPage />} />
        </Route>
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
