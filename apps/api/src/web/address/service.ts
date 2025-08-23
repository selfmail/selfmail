import { db } from "database";
import { status } from "elysia";
import { Activity } from "services/activity";
import { Ratelimit } from "services/ratelimit";
import type { AddressModule } from "./module";

export abstract class AddressService {
	static async createAddress({
		email,
		domain,
		workspaceId,
		memberId,
		memberName,
	}: AddressModule.CreateAddressBody & {
		workspaceId: string;
		memberId: string;
		memberName: string;
	}) {
		const isLimited = await Ratelimit.limit(
			`address:create:${workspaceId}:${memberId}`,
		);
		if (!isLimited.success) {
			return status(429, "Rate limit exceeded");
		}

		// Special handling for selfmail.app domain
		const isSelfmailDomain = domain === "selfmail.app";

		if (!isSelfmailDomain) {
			// Check if domain belongs to workspace and is verified
			const workspaceDomain = await db.domain.findFirst({
				where: {
					domain,
					workspaceId,
					verified: true,
				},
			});

			if (!workspaceDomain) {
				return status(
					400,
					"Domain is not verified or doesn't belong to this workspace",
				);
			}
		}

		// Check if email already exists
		const existingAddress = await db.address.findUnique({
			where: { email },
		});

		if (existingAddress) {
			return status(409, "Email address already exists");
		}

		// Create the address
		const address = await db.address.create({
			data: {
				email,
			},
		});

		if (!address) {
			return status(500, "Failed to create address");
		}

		// Associate the address with the member
		await db.memberAddress.create({
			data: {
				memberId,
				addressId: address.id,
			},
		});

		// Log activity
		Activity.capture({
			color: "positive",
			title: `Email address ${email} created by ${memberName} at ${new Date().toISOString()}.`,
			type: "event",
			workspaceId,
		});

		return {
			success: true,
			address: {
				id: address.id,
				email: address.email,
			},
		};
	}

	static async deleteAddress({
		id,
		workspaceId,
		memberId,
		memberName,
	}: AddressModule.DeleteAddressBody & {
		workspaceId: string;
		memberId: string;
		memberName: string;
	}) {
		// Check if member has access to this address
		const memberAddress = await db.memberAddress.findFirst({
			where: {
				memberId,
				addressId: id,
			},
			include: {
				address: true,
			},
		});

		if (!memberAddress) {
			return status(404, "Address not found or access denied");
		}

		// Delete the address (this will cascade delete memberAddress relationship)
		await db.address.delete({
			where: { id },
		});

		// Log activity
		Activity.capture({
			color: "negative",
			title: `Email address ${memberAddress.address.email} deleted by ${memberName} at ${new Date().toISOString()}.`,
			type: "event",
			workspaceId,
		});

		return {
			success: true,
			message: "Address deleted successfully",
		};
	}

	static async getWorkspaceDomains(workspaceId: string) {
		const domains = await db.domain.findMany({
			where: {
				workspaceId,
				verified: true,
			},
			select: {
				id: true,
				domain: true,
			},
		});

		// Always include selfmail.app as an available domain
		const allDomains = [
			{
				id: "selfmail-app",
				domain: "selfmail.app",
			},
			...domains,
		];

		return allDomains;
	}
	static async getAddressEmails(workspaceId: string) {
		// Get all addresses for the workspace through member addresses
		const memberAddresses = await db.memberAddress.findMany({
			where: {
				member: {
					workspaceId,
				},
			},
			select: { addressId: true },
		});

		const addressIds = memberAddresses.map((ma) => ma.addressId);

		if (addressIds.length === 0) {
			return {
				emails: [],
				totalCount: 0,
			};
		}

		// Get all emails for all addresses in the workspace
		const emails = await db.email.findMany({
			where: {
				addressId: {
					in: addressIds,
				},
			},
			orderBy: {
				date: "desc",
			},
			include: {
				address: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		const totalCount = await db.email.count({
			where: {
				addressId: {
					in: addressIds,
				},
			},
		});

		return {
			emails,
			totalCount,
		};
	}

	static async getEmailsByAddressId({
		addressId,
		workspaceId,
		page = 1,
		limit = 20,
		search,
	}: {
		addressId: string;
		workspaceId: string;
		page?: number;
		limit?: number;
		search?: string;
	}) {
		// First, verify that the address exists and belongs to the workspace
		const memberAddress = await db.memberAddress.findFirst({
			where: {
				addressId,
				member: {
					workspaceId,
				},
			},
			include: {
				address: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		if (!memberAddress) {
			return status(404, "Address not found or access denied");
		}

		// Build the where clause for emails
		const whereClause: {
			addressId: string;
			OR?: Array<{
				subject?: { contains: string; mode: "insensitive" };
				fromEmail?: { contains: string; mode: "insensitive" };
				fromName?: { contains: string; mode: "insensitive" };
			}>;
		} = {
			addressId,
		};

		// Add search functionality if provided
		if (search) {
			whereClause.OR = [
				{
					subject: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					fromEmail: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					fromName: {
						contains: search,
						mode: "insensitive",
					},
				},
			];
		}

		// Get emails for this specific address
		const emails = await db.email.findMany({
			where: whereClause,
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				date: "desc",
			},
			include: {
				address: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		// Get total count for pagination
		const totalCount = await db.email.count({
			where: whereClause,
		});

		return {
			emails,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
			address: memberAddress.address,
		};
	}

	static async getAddressEmailsById({
		addressId,
		workspaceId,
		page = 1,
		limit = 20,
		search,
	}: {
		addressId: string;
		workspaceId: string;
		page?: number;
		limit?: number;
		search?: string;
	}) {
		// Verify that the address belongs to a member of this workspace
		const memberAddress = await db.memberAddress.findFirst({
			where: {
				addressId,
				member: {
					workspaceId,
				},
			},
			include: {
				address: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		if (!memberAddress) {
			return status(404, "Address not found or access denied");
		}

		// Build the where clause for emails
		const whereClause: {
			addressId: string;
			OR?: Array<{
				subject?: { contains: string; mode: "insensitive" };
				fromEmail?: { contains: string; mode: "insensitive" };
				fromName?: { contains: string; mode: "insensitive" };
			}>;
		} = {
			addressId,
		};

		// Add search functionality if provided
		if (search) {
			whereClause.OR = [
				{
					subject: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					fromEmail: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					fromName: {
						contains: search,
						mode: "insensitive",
					},
				},
			];
		}

		// Get emails for this specific address
		const emails = await db.email.findMany({
			where: whereClause,
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				date: "desc",
			},
			include: {
				address: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		// Get total count for pagination
		const totalCount = await db.email.count({
			where: whereClause,
		});

		return {
			emails,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
			address: memberAddress.address,
		};
	}
}
