import { Permission, Role, ROLE_PERMISSIONS } from "@/types/rbac";

export class RbacService {
  public static hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  public static canAccessAdminPage(role: Role, path: string): boolean {
    if (role === "SUPER_ADMIN") return true;

    if (role === "ADMIN") {
      // Cannot manage users or website settings
      if (path.startsWith("/admin/users") || path.startsWith("/admin/settings")) {
        return false;
      }
      return true;
    }

    if (role === "STAFF") {
      // Staff can only access posters, custom posters, orders, and dashboard
      const allowedPaths = ["/admin", "/admin/posters", "/admin/custom-posters", "/admin/orders"];
      return allowedPaths.some(
        (allowed) => path === allowed || path.startsWith(`${allowed}/`)
      );
    }

    return false;
  }

  public static canDeleteUser(actorRole: Role, targetRole: Role): boolean {
    if (actorRole === "SUPER_ADMIN") return true;
    if (actorRole === "ADMIN") {
      // ADMIN cannot delete SUPER_ADMIN or other ADMINs
      return targetRole === "CUSTOMER" || targetRole === "STAFF";
    }
    return false;
  }
}
