import { prisma } from "@/lib/prisma";

export class AuditLogRepository {
  public static async logAction(
    userId: string | undefined,
    action: string,
    entity: string,
    entityId?: string,
    details?: any,
    ipAddress?: string
  ) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: details ? JSON.parse(JSON.stringify(details)) : undefined,
          ipAddress,
        },
      });
    } catch (err) {
      console.error("[AUDIT_LOG_ERROR]", err);
    }
  }

  public static async getLogs(limit = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}
