import { AdminRole } from "@prisma/client";

export type UserRole = "ADMIN" | "CUSTOMER" | keyof typeof AdminRole;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole;
}

export interface SessionUser extends AuthUser {
  image?: string | null;
}
