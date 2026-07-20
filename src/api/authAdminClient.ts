import { env as authEnv } from "@mcas/auth-client";

const authBase = () =>
  (authEnv.authServiceUrl ?? "http://localhost:8080").replace(/\/$/, "");

async function authFetch<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${authBase()}${path}`, { ...init, headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${response.status} ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export interface AdminUser {
  uid: string;
  oid: string | null;
  email: string;
  status: string;
  roleIds: string[];
  groupIds: string[];
}

export interface AdminGroup {
  id: string;
  name: string;
  description: string | null;
  system: boolean;
  roleIds: string[];
}

export interface AdminRole {
  id: string;
  name: string;
  system: boolean;
  rightIds: string[];
}

export interface AdminRight {
  id: string;
  label: string;
  description: string | null;
  origin: string;
}

export const RIGHT_USERS_MANAGE = "users.manage";
export const RIGHT_RBAC_MANAGE = "rbac.manage";
export const RIGHT_REGISTRIES_MANAGE = "registries.manage";

export function listUsers(token: string | null) {
  return authFetch<AdminUser[]>("/admin/users", token);
}

export function getUser(token: string | null, uid: string) {
  return authFetch<AdminUser>("/admin/users/" + uid, token);
}

export function createUser(
  token: string | null,
  body: { email: string; roleIds?: string[]; groupIds?: string[] },
) {
  return authFetch<AdminUser>("/admin/users", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function setUserRoles(token: string | null, uid: string, roleIds: string[]) {
  return authFetch("/admin/users/" + uid + "/roles", token, {
    method: "PUT",
    body: JSON.stringify({ roleIds }),
  });
}

export function setUserGroups(token: string | null, uid: string, groupIds: string[]) {
  return authFetch("/admin/users/" + uid + "/groups", token, {
    method: "PUT",
    body: JSON.stringify({ groupIds }),
  });
}

export function listGroups(token: string | null) {
  return authFetch<AdminGroup[]>("/admin/groups", token);
}

export function getGroup(token: string | null, groupId: string) {
  return authFetch<AdminGroup>("/admin/groups/" + encodeURIComponent(groupId), token);
}

export function createGroup(
  token: string | null,
  body: { name: string; description?: string },
) {
  return authFetch<AdminGroup>("/admin/groups", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function setGroupRoles(token: string | null, groupId: string, roleIds: string[]) {
  return authFetch("/admin/groups/" + encodeURIComponent(groupId) + "/roles", token, {
    method: "PUT",
    body: JSON.stringify({ roleIds }),
  });
}

export function deleteGroup(token: string | null, groupId: string) {
  return authFetch("/admin/groups/" + encodeURIComponent(groupId), token, {
    method: "DELETE",
  });
}

export function listRoles(token: string | null) {
  return authFetch<AdminRole[]>("/admin/roles", token);
}

export function getRole(token: string | null, roleId: string) {
  return authFetch<AdminRole>("/admin/roles/" + encodeURIComponent(roleId), token);
}

export function createRole(token: string | null, body: { name: string }) {
  return authFetch<AdminRole>("/admin/roles", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function setRoleRights(token: string | null, roleId: string, rightIds: string[]) {
  return authFetch("/admin/roles/" + encodeURIComponent(roleId) + "/rights", token, {
    method: "PUT",
    body: JSON.stringify({ rightIds }),
  });
}

export function deleteRole(token: string | null, roleId: string) {
  return authFetch("/admin/roles/" + encodeURIComponent(roleId), token, {
    method: "DELETE",
  });
}

export function listRights(token: string | null) {
  return authFetch<AdminRight[]>("/admin/rights", token);
}

export function upsertRightsCatalog(
  token: string | null,
  toolId: string,
  rights: { id: string; label?: string; description?: string }[],
) {
  return authFetch<{ created: number; skipped: number }>("/admin/rights/catalog", token, {
    method: "PUT",
    body: JSON.stringify({ tool_id: toolId, rights }),
  });
}
