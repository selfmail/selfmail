import { db } from "database";
import { status } from "elysia";
import { EmailQueue } from "services/queue";
import { Ratelimit } from "services/ratelimit";
import { Files } from "../../lib/files";

export class WorkspaceService {
	static async create({
		name,
		userId,
		image,
		username,
	}: {
		name: string;
		image?: File;
		userId: string;
		username: string;
	}) {
		// Ratelimiting
		const allowed = await Ratelimit.limit(userId);
		if (!allowed)
			return status(429, "Too many requests. Please try again later.");

		// fetch workspaces by user (user can only create 2 workspaces for now)
		// TODO: increase number
		const existingWorkspaces = await db.workspace.count({
			where: {
				ownerId: userId,
			},
		});

		if (existingWorkspaces >= 2) {
			return status(
				403,
				"You have reached the maximum number of workspaces allowed.",
			);
		}

		let imageUrl: string | undefined;

		if (image) {
			imageUrl = await Files.upload({
				file: image,
				name: image.name,
				bucket: "workspace-icons",
			});
		}

		const workspace = await db.workspace.create({
			data: {
				name,
				ownerId: userId,
				image: imageUrl,
			},
		});

		if (!workspace) return status(500, "Internal Server Error");

		const member = await db.member.create({
			data: {
				userId,
				workspaceId: workspace.id,
				profileName: username,
			},
		});

		if (!member) return status(500, "Internal Server Error");

		return {
			success: true,
			workspaceId: workspace.id,
		};
	}

	static async user(userId: string) {
		const workspaces = await db.member.findMany({
			where: {
				userId,
			},
			include: {
				workspace: {
					select: {
						image: true,
						name: true,
						id: true,
						slug: true,
					},
				},
			},
		});

		return workspaces.map((member) => ({
			name: member.workspace.name,
			image: member.workspace.image,
			id: member.workspace.id,
			slug: member.workspace.slug,
		}));
	}

	static async getAddresses(workspaceId: string, userId: string) {
		// First verify the user has access to this workspace
		const member = await db.member.findFirst({
			where: {
				userId,
				workspaceId,
			},
		});

		if (!member) {
			return status(403, "Access denied to workspace");
		}

		// Get all addresses that this member has access to
		const memberAddresses = await db.memberAddress.findMany({
			where: {
				memberId: member.id,
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

		// Transform to the expected format and add isDefault field
		return memberAddresses.map((memberAddress, index) => ({
			id: memberAddress.address.id,
			email: memberAddress.address.email,
			name: undefined, // Address model doesn't have a name field
			isDefault: index === 0, // First address is default for now
		}));
	}

	static async sendEmail(
		workspaceId: string,
		userId: string,
		emailData: {
			from: string;
			to: string[];
			cc?: string[];
			bcc?: string[];
			subject: string;
			text: string;
			html?: string;
			workspaceId: string;
		},
	) {
		// Ratelimiting
		const allowed = await Ratelimit.limit(
			`${userId}:${workspaceId}:send-email`,
		);
		if (!allowed)
			return status(429, "Too many requests. Please try again later.");

		// Verify user access to workspace
		const member = await db.member.findFirst({
			where: {
				userId,
				workspaceId,
			},
		});

		if (!member) {
			return status(403, "Access denied to workspace");
		}

		// Verify the from address belongs to this workspace and user has access
		const fromAddress = await db.memberAddress.findFirst({
			where: {
				memberId: member.id,
				address: {
					email: emailData.from,
				},
			},
			include: {
				address: true,
			},
		});

		if (!fromAddress) {
			return status(400, "Invalid sender address or access denied");
		}

		// Helper function to convert simple email strings to AddressObject format
		const convertEmailAddress = (address: string) => ({
			value: [{ address, name: undefined }],
			text: address,
			html: address,
		});

		const convertEmailAddresses = (addresses: string[]) =>
			addresses.map(convertEmailAddress);

		// Prepare the relay data in the correct OutboundEmail format
		const relayData = {
			from: convertEmailAddress(emailData.from),
			to: convertEmailAddresses(emailData.to),
			cc: emailData.cc ? convertEmailAddresses(emailData.cc) : undefined,
			bcc: emailData.bcc ? convertEmailAddresses(emailData.bcc) : undefined,
			subject: emailData.subject,
			text: emailData.text,
			html: emailData.html,
			attachments: [],
			headers: {},
			headerLines: [],
		};

		try {
			console.log("Sending email via relay:", relayData);
			// Send to relay service
			await EmailQueue.processOutbound(relayData);

			// Log the email sending activity
			await db.activity.create({
				data: {
					title: "Email Sent",
					description: `Email sent to ${emailData.to.join(", ")}`,
					color: "positive",
					type: "event",
					workspaceId,
					userId,
				},
			});

			return {
				success: true,
				message: "Email sent successfully",
			};
		} catch (error) {
			console.error("Email sending failed:", error);
			return status(500, {
				success: false,
				message:
					error instanceof Error ? error.message : "Failed to send email",
			});
		}
	}
}
