import { AdminRole } from "@prisma/client";

export type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";

export type Permission =
  | "manage:categories"
  | "manage:subcategories"
  | "manage:collections"
  | "manage:posters"
  | "manage:orders"
  | "manage:custom_posters"
  | "manage:customers"
  | "manage:coupons"
  | "manage:delivery_zones"
  | "manage:settings"
  | "manage:users"
  | "manage:analytics"
  | "view:admin_dashboard";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "manage:categories",
    "manage:subcategories",
    "manage:collections",
    "manage:posters",
    "manage:orders",
    "manage:custom_posters",
    "manage:customers",
    "manage:coupons",
    "manage:delivery_zones",
    "manage:settings",
    "manage:users",
    "manage:analytics",
    "view:admin_dashboard",
  ],
  ADMIN: [
    "manage:categories",
    "manage:subcategories",
    "manage:collections",
    "manage:posters",
    "manage:orders",
    "manage:custom_posters",
    "manage:customers",
    "manage:coupons",
    "manage:delivery_zones",
    "view:admin_dashboard",
  ],
  STAFF: [
    "manage:posters",
    "manage:orders",
    "manage:custom_posters",
    "view:admin_dashboard",
  ],
  CUSTOMER: [],
};
