import { db } from "database";
import { Activity, type ActivityFilters } from "services/activity";

export class ActivityService {
	static async getActivities({
		workspaceId,
		userId,
		page = 1,
		limit = 50,
		type,
		color,
		dateFrom,
		dateTo,
	}: {
		workspaceId: string;
		userId: string;
		page?: number;
		limit?: number;
		type?: string | string[];
		color?: string | string[];
		dateFrom?: string;
		dateTo?: string;
	}) {
		try {
			// First verify the user has access to this workspace
			const member = await db.member.findFirst({
				where: {
					userId,
					workspaceId,
				},
			});

			if (!member) {
				throw new Error("Access denied to workspace");
			}

			// Build activity filters
			const filters: ActivityFilters = {
				workspaceId,
				limit,
				offset: (page - 1) * limit,
				sortBy: "createdAt",
				sortOrder: "desc",
			};

			if (type) {
				filters.type = Array.isArray(type)
					? (type as ("task" | "note" | "event" | "reminder")[])
					: [type as "task" | "note" | "event" | "reminder"];
			}

			if (color) {
				filters.color = Array.isArray(color)
					? (color as ("neutral" | "positive" | "negative")[])
					: [color as "neutral" | "positive" | "negative"];
			}

			if (dateFrom) {
				filters.dateFrom = new Date(dateFrom);
			}

			if (dateTo) {
				filters.dateTo = new Date(dateTo);
			}

			const result = await Activity.getActivities(filters);

			return {
				activities: result.activities,
				totalCount: result.total,
				page,
				limit,
				totalPages: Math.ceil(result.total / limit),
			};
		} catch (error) {
			console.error("Failed to fetch activities:", error);
			throw new Error("Failed to fetch activities");
		}
	}

	static async createActivity({
		workspaceId,
		userId,
		title,
		description,
		type = "event",
		color = "neutral",
	}: {
		workspaceId: string;
		userId: string;
		title: string;
		description?: string;
		type?: "task" | "note" | "event" | "reminder";
		color?: "neutral" | "positive" | "negative";
	}) {
		try {
			// First verify the user has access to this workspace
			const member = await db.member.findFirst({
				where: {
					userId,
					workspaceId,
				},
			});

			if (!member) {
				throw new Error("Access denied to workspace");
			}

			const activity = await Activity.capture({
				workspaceId,
				userId,
				title,
				description,
				type,
				color,
			});

			return {
				success: true,
				activity,
			};
		} catch (error) {
			console.error("Failed to create activity:", error);
			throw new Error("Failed to create activity");
		}
	}
}
