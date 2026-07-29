import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { RbacService } from "@/services/rbac.service";
import { Role } from "@/types/rbac";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "super-secret-nextauth-key-change-in-production-32-bytes-min",
    });

    if (!token || token.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const adminRole: Role = (token.adminRole as Role) || "ADMIN";

    // Enforce fine-grained RBAC permission per admin subpath
    const isAllowed = RbacService.canAccessAdminPage(adminRole, pathname);
    if (!isAllowed) {
      return new NextResponse("403 Forbidden: Insufficient Permissions", { status: 403 });
    }
  }

  // Protect /account customer dashboard routes
  if (pathname.startsWith("/account")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "super-secret-nextauth-key-change-in-production-32-bytes-min",
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
