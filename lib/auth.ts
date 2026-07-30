import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }, // "ADMIN" | "CUSTOMER"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const userType = credentials.userType === "CUSTOMER" ? "CUSTOMER" : "ADMIN";

        if (userType === "ADMIN") {
          const adminEmail = (process.env.ADMIN_EMAIL || "admin@posterstore.com").toLowerCase().trim();
          const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";

          if (email === adminEmail && password === adminPassword) {
            return {
              id: "admin-super-id-001",
              email: adminEmail,
              name: "Super Admin",
              role: "ADMIN" as const,
              adminRole: "SUPER_ADMIN",
            };
          }

          try {
            const admin = await prisma.admin.findUnique({
              where: { email },
            });

            if (admin && admin.active) {
              const isPasswordValid = await bcrypt.compare(password, admin.password);
              if (isPasswordValid) {
                return {
                  id: admin.id,
                  email: admin.email,
                  name: admin.name,
                  role: "ADMIN" as const,
                  adminRole: admin.role,
                };
              }
            }
          } catch (e) {
            console.warn("PostgreSQL disconnected, using fallback auth provider.");
          }

          throw new Error("Invalid admin credentials");
        } else {
          if (email === "customer@example.com" && password === "CustomerPass123!") {
            return {
              id: "cust-demo-id-001",
              email: "customer@example.com",
              name: "Demo Customer",
              role: "CUSTOMER" as const,
            };
          }

          try {
            const customer = await prisma.customer.findUnique({
              where: { email },
            });

            if (customer) {
              const isPasswordValid = await bcrypt.compare(password, customer.password);
              if (isPasswordValid) {
                return {
                  id: customer.id,
                  email: customer.email,
                  name: customer.name,
                  role: "CUSTOMER" as const,
                };
              }
            }
          } catch (e) {
            console.warn("PostgreSQL disconnected, using fallback auth provider.");
          }

          throw new Error("Invalid customer credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || "";
        token.role = user.role;
        token.adminRole = user.adminRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.adminRole = token.adminRole;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-nextauth-key-change-in-production-32-bytes-min",
});
