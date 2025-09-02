import { db } from "database";
import { status } from "elysia";
import type { SMTPModule } from "./module";

export abstract class SMTPService {
	/**
	 * Generate new SMTP credentials for a specific address
	 */
	static async generateCredentials({
		addressId,
		title,
		description,
		activeUntil,
		workspaceId,
		memberId,
	}: SMTPModule.SmtpCredentialsBody & {
		workspaceId: string;
		memberId: string;
	}) {
		// Verify the address exists and the member has access to it
		const memberAddress = await db.memberAddress.findFirst({
			where: {
				addressId,
				member: {
					id: memberId,
					workspaceId,
				},
			},
			include: {
				address: true,
			},
		});

		if (!memberAddress) {
			throw status(404, "Address not found or you don't have access to it");
		}

		const username = SMTPService.generateUsername();
		const password = SMTPService.generatePassword();

		const credentials = await db.smtpCredentials.create({
			data: {
				title,
				description,
				username,
				password,
				memberId,
				workspaceId,
				addressId,
				activeUntil,
			},
			include: {
				address: {
					select: {
						email: true,
					},
				},
			},
		});

		return {
			id: credentials.id,
			title: credentials.title,
			description: credentials.description,
			username: credentials.username,
			password: credentials.password,
			addressEmail: credentials.address.email,
			createdAt: credentials.createdAt,
			activeUntil: credentials.activeUntil,
		};
	}

	static async listCredentials({
		workspaceId,
		page = 1,
		limit = 20,
		addressId,
	}: {
		workspaceId: string;
		memberId: string;
	} & SMTPModule.CredentialsQuery) {
		const offset = (page - 1) * limit;

		const where = {
			workspaceId,
			...(addressId && { addressId }),
		};

		// Get total count
		const totalCount = await db.smtpCredentials.count({ where });

		// Get credentials
		const credentials = await db.smtpCredentials.findMany({
			where,
			include: {
				address: {
					select: {
						email: true,
					},
				},
				member: {
					select: {
						profileName: true,
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			skip: offset,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			credentials: credentials.map((cred) => ({
				id: cred.id,
				title: cred.title,
				description: cred.description,
				username: cred.username,
				// Don't expose password in list view
				passwordViewed: !!cred.passwordViewedAt,
				addressEmail: cred.address.email,
				createdBy: cred.member.profileName || cred.member.user.name,
				createdAt: cred.createdAt,
				updatedAt: cred.updatedAt,
				activeUntil: cred.activeUntil,
				isExpired: cred.activeUntil ? new Date() > cred.activeUntil : false,
			})),
			pagination: {
				page,
				limit,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		};
	}
	static async getCredentials({
		credentialsId,
		workspaceId,
	}: {
		credentialsId: string;
		workspaceId: string;
		memberId: string;
	}) {
		const credentials = await db.smtpCredentials.findFirst({
			where: {
				id: credentialsId,
				workspaceId,
			},
			include: {
				address: {
					select: {
						email: true,
					},
				},
				member: {
					select: {
						profileName: true,
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		if (!credentials) {
			throw status(404, "SMTP credentials not found");
		}

		// Check if password has already been viewed
		const canViewPassword = !credentials.passwordViewedAt;

		// If password can be viewed, mark it as viewed
		if (canViewPassword) {
			await db.smtpCredentials.update({
				where: {
					id: credentialsId,
				},
				data: {
					passwordViewedAt: new Date(),
				},
			});
		}

		return {
			id: credentials.id,
			title: credentials.title,
			description: credentials.description,
			username: credentials.username,
			password: canViewPassword ? credentials.password : null, // Only show password if not viewed before
			passwordViewed: !!credentials.passwordViewedAt,
			addressEmail: credentials.address.email,
			createdBy: credentials.member.profileName || credentials.member.user.name,
			createdAt: credentials.createdAt,
			updatedAt: credentials.updatedAt,
			activeUntil: credentials.activeUntil,
			isExpired: credentials.activeUntil
				? new Date() > credentials.activeUntil
				: false,
		};
	}

	static async updateCredentials({
		credentialsId,
		workspaceId,
		title,
		description,
		activeUntil,
	}: {
		credentialsId: string;
		workspaceId: string;
		memberId: string;
	} & SMTPModule.UpdateSmtpCredentialsBody) {
		// Verify credentials exist and belong to workspace
		const existingCredentials = await db.smtpCredentials.findFirst({
			where: {
				id: credentialsId,
				workspaceId,
			},
		});

		if (!existingCredentials) {
			throw status(404, "SMTP credentials not found");
		}

		const updatedCredentials = await db.smtpCredentials.update({
			where: {
				id: credentialsId,
			},
			data: {
				...(title && { title }),
				...(description !== undefined && { description }),
				...(activeUntil !== undefined && { activeUntil }),
			},
			include: {
				address: {
					select: {
						email: true,
					},
				},
			},
		});

		return {
			id: updatedCredentials.id,
			title: updatedCredentials.title,
			description: updatedCredentials.description,
			username: updatedCredentials.username,
			addressEmail: updatedCredentials.address.email,
			createdAt: updatedCredentials.createdAt,
			updatedAt: updatedCredentials.updatedAt,
			activeUntil: updatedCredentials.activeUntil,
		};
	}

	static async deleteCredentials({
		credentialsId,
		workspaceId,
	}: {
		credentialsId: string;
		workspaceId: string;
		memberId: string;
	}) {
		// Verify credentials exist and belong to workspace
		const existingCredentials = await db.smtpCredentials.findFirst({
			where: {
				id: credentialsId,
				workspaceId,
			},
		});

		if (!existingCredentials) {
			throw status(404, "SMTP credentials not found");
		}

		// Delete the credentials
		await db.smtpCredentials.delete({
			where: {
				id: credentialsId,
			},
		});

		return {
			success: true,
			message: "SMTP credentials deleted successfully",
		};
	}

	/**
	 * Regenerate password for existing SMTP credentials
	 */
	static async regeneratePassword({
		credentialsId,
		workspaceId,
	}: {
		credentialsId: string;
		workspaceId: string;
		memberId: string;
	}) {
		// Verify credentials exist and belong to workspace
		const existingCredentials = await db.smtpCredentials.findFirst({
			where: {
				id: credentialsId,
				workspaceId,
			},
		});

		if (!existingCredentials) {
			throw status(404, "SMTP credentials not found");
		}

		// Generate new password
		const newPassword = SMTPService.generatePassword();

		// Update the credentials with new password and reset passwordViewedAt
		const updatedCredentials = await db.smtpCredentials.update({
			where: {
				id: credentialsId,
			},
			data: {
				password: newPassword,
				passwordViewedAt: null, // Reset so password can be viewed again
			},
			include: {
				address: {
					select: {
						email: true,
					},
				},
			},
		});

		return {
			id: updatedCredentials.id,
			title: updatedCredentials.title,
			username: updatedCredentials.username,
			password: updatedCredentials.password,
			addressEmail: updatedCredentials.address.email,
			updatedAt: updatedCredentials.updatedAt,
		};
	}

	/**
	 * Generate a secure username for SMTP credentials
	 */
	private static generateUsername(): string {
		const timestamp = Date.now().toString(36);
		const randomString = crypto.randomUUID().split("-")[0];
		return `smtp_${timestamp}_${randomString}`;
	}

	/**
	 * Generate a secure password for SMTP credentials
	 */
	private static generatePassword(): string {
		// Generate a 32-character secure password
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";

		for (let i = 0; i < 32; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return password;
	}
}
