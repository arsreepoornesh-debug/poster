"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Role, Permission } from "@/types/rbac";
import { RbacService } from "@/services/rbac.service";

interface AuthGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  allowedRoles?: Role[];
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  permission,
  allowedRoles,
  fallback = null,
}: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-4 text-xs text-muted-foreground animate-pulse">Checking authorization...</div>;
  }

  if (!session?.user) {
    return fallback;
  }

  const role: Role = (session.user.adminRole as Role) || (session.user.role as Role) || "CUSTOMER";

  if (allowedRoles && !allowedRoles.includes(role)) {
    return fallback;
  }

  if (permission && !RbacService.hasPermission(role, permission)) {
    return fallback;
  }

  return <>{children}</>;
}
