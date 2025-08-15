import { db } from "database";
import { status } from "elysia";
import { Files } from "../../lib/files";
import { Ratelimit } from "../../lib/ratelimit";

export class WorkspaceService {
	static async create({
		name,
		userId,
		image,
	}: {
		name: string;
		image?: File;
		userId: string;
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

		return {
			success: true,
			workspaceId: workspace.id,
		};
	}
}
