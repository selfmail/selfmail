import { db } from "database";
import { status } from "elysia";
import { Activity } from "../../lib/activity";
import { Ratelimit } from "../../lib/ratelimit";
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
}
