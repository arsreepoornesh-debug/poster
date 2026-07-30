import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    const emailClean = String(email).toLowerCase().trim();
    const passwordStr = String(password);

    const adminEmail = (process.env.ADMIN_EMAIL || "arsp@gmail.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Poornesh@577";

    // 1. Check Super Admin Credentials
    if (emailClean === adminEmail && passwordStr === adminPassword) {
      return NextResponse.json({
        success: true,
        user: {
          name: "Super Admin",
          email: adminEmail,
          role: "ADMIN",
        }
      });
    }

    // 2. Check Database Admin Table
    try {
      const admin = await prisma.admin.findUnique({ where: { email: emailClean } });
      if (admin && admin.active) {
        const isPasswordValid = await bcrypt.compare(passwordStr, admin.password);
        if (isPasswordValid) {
          return NextResponse.json({
            success: true,
            user: {
              name: admin.name,
              email: admin.email,
              role: "ADMIN",
            }
          });
        }
      }
    } catch (e) {
      console.error("Simple auth admin DB check error:", e);
    }

    // 3. Check Demo Customer Credentials
    if (emailClean === "customer@example.com" && passwordStr === "CustomerPass123!") {
      return NextResponse.json({
        success: true,
        user: {
          name: "Demo Customer",
          email: "customer@example.com",
          role: "CUSTOMER",
        }
      });
    }

    // 4. Check Database Customer Table
    try {
      const customer = await prisma.customer.findUnique({ where: { email: emailClean } });
      if (customer) {
        const isPasswordValid = await bcrypt.compare(passwordStr, customer.password);
        if (isPasswordValid) {
          return NextResponse.json({
            success: true,
            user: {
              name: customer.name,
              email: customer.email,
              role: "CUSTOMER",
            }
          });
        }
      }
    } catch (e) {
      console.error("Simple auth customer DB check error:", e);
    }

    return NextResponse.json({ success: false, error: "Invalid email or password combination." }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}
