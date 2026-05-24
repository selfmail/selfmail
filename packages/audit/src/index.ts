import { type AuditLog, db, type Prisma } from "@selfmail/db";

export const auditActions = [
  "user.login",
  "user.logout",
  "user.password_changed",
  "user.2fa_enabled",
  "user.created_api_key",
  "user.deleted_api_key",
  "domain.created",
  "domain.verified",
  "domain.deleted",
  "domain.dns_check_failed",
  "mailbox.created",
  "mailbox.deleted",
  "mailbox.quota_changed",
  "message.deleted",
  "message.moved",
  "message.restored",
  "billing.plan_changed",
  "billing.payment_failed",
  "billing.subscription_cancelled",
  "admin.user_suspended",
  "admin.user_unsuspended",
  "admin.login_as_user",
] as const;

export const auditActorTypes = [
  "user",
  "admin",
  "system",
  "api_key",
  "cron",
  "webhook",
] as const;

export type AuditAction = (typeof auditActions)[number];
export type AuditActorType = (typeof auditActorTypes)[number];

export interface AuditActor {
  type: AuditActorType;
  id?: string;
  email?: string;
}

export interface AuditTarget {
  type: string;
  id: string;
}

export interface AuditRequest {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
}

export interface CreateAuditLogInput {
  tenantId: string;
  actor: AuditActor;
  action: AuditAction;
  target?: AuditTarget;
  request?: AuditRequest;
  metadata?: Prisma.InputJsonObject;
}

export const createAuditLog = (input: CreateAuditLogInput): Promise<AuditLog> =>
  db.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorType: input.actor.type,
      actorId: input.actor.id,
      actorEmail: input.actor.email,
      action: input.action,
      targetType: input.target?.type,
      targetId: input.target?.id,
      ipAddress: input.request?.ipAddress,
      userAgent: input.request?.userAgent,
      requestId: input.request?.requestId,
      sessionId: input.request?.sessionId,
      metadata: input.metadata ?? {},
    },
  });
