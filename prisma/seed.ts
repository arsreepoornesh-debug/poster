import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const customerPasswordHash = await bcrypt.hash("CustomerPass123!", 10);

  // 1. Seed Super Admin
  const admin = await prisma.admin.upsert({
    where: { email: "admin@posterstore.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@posterstore.com",
      password: adminPasswordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // 2. Seed Demo Customer
  const customer = await prisma.customer.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@example.com",
      password: customerPasswordHash,
      phone: "9876543210",
    },
  });

  console.log("Database seeded successfully!");
  console.log("Admin Email:", admin.email);
  console.log("Customer Email:", customer.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
