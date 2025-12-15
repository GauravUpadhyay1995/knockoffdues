"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/context/PermissionContext";

export default function PermissionGate({
  permission,
  children,
  fallback = null
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { permissions, loading } = usePermissions();

  if (loading) return null; // or a skeleton loader

  if (!permissions.includes(permission)) return fallback;

  return <>{children}</>;
}
