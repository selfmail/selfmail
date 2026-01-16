import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const db = new PrismaClient({ adapter });

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
} from "../generated/prisma/client";
