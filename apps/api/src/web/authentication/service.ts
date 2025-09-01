import { db } from "database";
import { status } from "elysia";
import { Mail } from "services/mail";
import { generateVerifyEmailTemplate } from "transactional";
import { rateLimitMiddleware } from "../../lib/auth-middleware";
import type { AuthenticationModule } from "./module";

export abstract class AuthenticationService {
	static async handleRegister(
		{ email, password, name }: AuthenticationModule.RegisterBody,
		clientIp: string,
	) {
		// Rate limiting for registration
		const rateLimit = await rateLimitMiddleware(clientIp, "auth");
		if (!rateLimit.success) {
			return status(429, "Too many requests. Please try again later.");
		}

		// Check if the user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return status(409, "Email already registered. Please log in instead.");
		}

		// Hash password
		const passwordHash = await Bun.password.hash(password, "argon2id");

		// Create user
		const user = await db.user.create({
			data: {
				email,
				password: passwordHash,
				name,
			},
		});

		if (!user)
			throw status(500, "Failed to create user. Please try again later.");

		// create OTP
		const otpToken = Math.floor(100000 + Math.random() * 900000).toString();

		// Save OTP to database
		await db.emailVerification.create({
			data: {
				token: otpToken,
				email: user.email,
				userId: user.id,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
			},
		});

		// send verify token to user
		const mail = await Mail.sendHtmlEmail({
			to: user.email,
			from: "noreply@selfmail.app",
			subject: "Verify your email for Selfmail",

			html: (
				await generateVerifyEmailTemplate({
					name: user.name,
					token: otpToken,
				})
			).html,
			text: (
				await generateVerifyEmailTemplate({
					name: user.name,
					token: otpToken,
				})
			).text,
		});

		if (!mail.success) {
			throw status(500, "Failed to send verification email");
		}

		// Create session token
		const sessionToken = crypto.randomUUID();

		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			sessionToken,
		};
	}

	static async verifyEmail(token: string, _tempSessionToken: string) {
		// Find the OTP token in the database
		const verification = await db.emailVerification.findUnique({
			where: { token },
			include: {
				user: true,
			},
		});

		if (!verification) {
			throw status(401, "Invalid OTP token");
		}

		// Check if the token has expired
		const now = new Date();
		if (verification.expiresAt < now) {
			// Clean up expired token
			await db.emailVerification.delete({
				where: { id: verification.id },
			});
			throw status(401, "Email verification token has expired");
		}

		// Mark email as verified
		await db.user.update({
			where: { id: verification.user.id },
			data: { emailVerified: new Date() },
		});

		return {
			success: true,
			user: {
				id: verification.user.id,
				email: verification.user.email,
				name: verification.user.name,
			},
		};
	}

	static async createOTP(userId: string): Promise<string> {
		// Generate a 6-digit OTP
		const otpToken = Math.floor(100000 + Math.random() * 900000).toString();

		// Set expiration time (10 minutes from now)
		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + 10);

		// Delete any existing OTP tokens for this user
		await db.twoFactorToken.deleteMany({
			where: { userId },
		});

		// Create new OTP token
		await db.twoFactorToken.create({
			data: {
				token: otpToken,
				userId,
				expiresAt,
			},
		});

		return otpToken;
	}

	static async handleLogin(
		{ email, password }: AuthenticationModule.LoginBody,
		clientIp: string,
	) {
		// Rate limiting for login
		const rateLimit = await rateLimitMiddleware(clientIp, "auth");
		if (!rateLimit.success) {
			return status(429, "Too many requests. Please try again later.");
		}

		const user = await db.user.findUnique({
			where: { email },
		});

		if (!user || !(await Bun.password.verify(password, user.password))) {
			return status(401, "Invalid email or password");
		}

		// Create session token
		const sessionToken = crypto.randomUUID();

		// Create session (delete existing sessions for this user first)
		await db.session.deleteMany({
			where: { userId: user.id },
		});

		const session = await db.session.create({
			data: {
				token: sessionToken,
				userId: user.id,
			},
		});

		if (!session) return status(500, "Failed to create session");

		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			sessionToken,
		};
	}

	static async handleLogout(sessionToken: string) {
		await db.session.deleteMany({
			where: { token: sessionToken },
		});

		return {
			success: true,
			message: "Logged out successfully",
		};
	}

	static async handleMe(userId: string) {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				twoFactorEnabled: true,
			},
		});

		if (!user) {
			throw status(404, "User not found");
		}

		return {
			user,
		};
	}
	static async hasPermissions(memberId: string, permissions: string[]) {
		// If no permissions to check, return early
		if (!permissions || permissions.length === 0) {
			return {
				hasPermissions: true,
				missingPermissions: [],
				userPermissions: [],
			};
		}

		// Single query to get all member permissions (direct + role-based)
		const member = await db.member.findUnique({
			where: { id: memberId },
			select: {
				MemberPermission: {
					select: {
						permission: {
							select: {
								name: true,
							},
						},
					},
				},
				roles: {
					select: {
						RolePermission: {
							select: {
								permission: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!member) {
			return {
				hasPermissions: false,
				missingPermissions: permissions,
				userPermissions: [],
			};
		}

		// Collect all permissions from direct assignments and roles
		const userPermissionSet = new Set<string>();

		// Add direct permissions
		for (const mp of member.MemberPermission) {
			userPermissionSet.add(mp.permission.name);
		}

		// Add role-based permissions
		for (const role of member.roles) {
			for (const rp of role.RolePermission) {
				userPermissionSet.add(rp.permission.name);
			}
		}

		// Check for missing permissions using Set for O(1) lookup
		const missingPermissions = permissions.filter(
			(permission) => !userPermissionSet.has(permission),
		);

		return {
			hasPermissions: missingPermissions.length === 0,
		};
	}
}
