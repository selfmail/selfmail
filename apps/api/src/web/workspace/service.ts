import { db } from "database";
import { status } from "elysia";
import { Files } from "../../lib/files";
import { Ratelimit } from "../../lib/ratelimit";

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
}
