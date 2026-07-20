import { Navigate } from "react-router-dom";
import { HasRight, useAuth } from "@mcas/auth-client";
import type { ReactNode } from "react";

export function RequireRight({
  right,
  children,
}: {
  right: string;
  children: ReactNode;
}) {
  const { user, getMcasToken } = useAuth();
  const allowed = HasRight(user ?? getMcasToken(), right);
  if (!allowed) {
    return <Navigate to="/" replace />;
  }
  return children;
}
