import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => new PrismaClient();

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;

export type {
  Account,
  Activity,
  ActivityColor,
  ActivityType,
  Address,
  AdminAccount,
  AdminSession,
  AdminUser,
  AdminVerification,
  AuthProvider,
  Blocked,
  Contact,
  Domain,
  Email,
  EmailVerification,
  Invitation,
  InvitationStatus,
  MagicLink,
  Member,
  MemberAddress,
  MemberPermission,
  MemberRole,
  Notification,
  NotificationType,
  Permission,
  Role,
  RolePermission,
  Session,
  SmtpCredentials,
  Sort,
  TwoFactorToken,
  User,
  Workspace,
} from "@prisma/client";
