import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => new PrismaClient();

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;

export type {
	Access,
	Activity,
	ActivityColor,
	ActivityType,
	Address,
	AdminAccount,
	AdminSession,
	AdminUser,
	AdminVerification,
	Contact,
	Domain,
	Email,
	EmailVerification,
	Error,
	Member,
	MemberAddress,
	MemberPermission,
	Notification,
	NotificationType,
	Permission,
	Plan,
	Role,
	RolePermission,
	Session,
	SmtpCredentials,
	Sort,
	TwoFactorToken,
	User,
	Waitlist,
	Workspace,
} from "@prisma/client";
