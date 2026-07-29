import { AdminRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
      adminRole?: AdminRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "CUSTOMER";
    adminRole?: AdminRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CUSTOMER";
    adminRole?: AdminRole;
  }
}
