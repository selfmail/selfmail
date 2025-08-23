import { db } from "database";

// Define types since they might not be exported yet from Prisma
export type ActivityColor = "neutral" | "positive" | "negative";
export type ActivityType = "task" | "note" | "event" | "reminder";

export interface PrismaActivity {
	id: string;
	title: string;
	description: string | null;
	color: ActivityColor;
	type: ActivityType;
	workspaceId: string;
	userId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface ActivityFilters {
	workspaceId?: string;
	userId?: string;
	type?: ActivityType | ActivityType[];
	color?: ActivityColor | ActivityColor[];
	dateFrom?: Date;
	dateTo?: Date;
	limit?: number;
	offset?: number;
	sortBy?: "createdAt" | "updatedAt" | "title";
	sortOrder?: "asc" | "desc";
}

export abstract class Activity {
	static async capture({
		color,
		title,
		createdAt = new Date(),
		userId,
		workspaceId,
		type,
		description,
	}: {
		workspaceId: string;
		userId?: string;
		title: string;
		color: "neutral" | "positive" | "negative";
		type: "task" | "note" | "event" | "reminder";
		description?: string;
		// optional, if not set, we will use the current date
		createdAt?: Date;
	}): Promise<PrismaActivity> {
		try {
			const activity = await db.activity.create({
				data: {
					title,
					description,
					color: color as ActivityColor,
					type: type as ActivityType,
					workspaceId,
					userId,
					createdAt,
				},
			});

			return activity;
		} catch (error) {
			console.error("Failed to capture activity:", error);
			throw new Error("Failed to capture activity");
		}
	}

	static async getActivities(filters: ActivityFilters = {}): Promise<{
		activities: PrismaActivity[];
		total: number;
	}> {
		try {
			const {
				workspaceId,
				userId,
				type,
				color,
				dateFrom,
				dateTo,
				limit = 50,
				offset = 0,
				sortBy = "createdAt",
				sortOrder = "desc",
			} = filters;

			// Build where clause
			const where: any = {};

			if (workspaceId) {
				where.workspaceId = workspaceId;
			}

			if (userId) {
				where.userId = userId;
			}

			if (type) {
				where.type = Array.isArray(type) ? { in: type } : type;
			}

			if (color) {
				where.color = Array.isArray(color) ? { in: color } : color;
			}

			if (dateFrom || dateTo) {
				where.createdAt = {};
				if (dateFrom) {
					where.createdAt.gte = dateFrom;
				}
				if (dateTo) {
					where.createdAt.lte = dateTo;
				}
			}

			// Get activities with pagination
			const [activities, total] = await Promise.all([
				db.activity.findMany({
					where,
					orderBy: {
						[sortBy]: sortOrder,
					},
					take: limit,
					skip: offset,
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						workspace: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				}),
				db.activity.count({ where }),
			]);

			return {
				activities,
				total,
			};
		} catch (error) {
			console.error("Failed to get activities:", error);
			throw new Error("Failed to get activities");
		}
	}

	static async getActivity(id: string): Promise<PrismaActivity | null> {
		try {
			const activity = await db.activity.findUnique({
				where: { id },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					workspace: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
				},
			});

			return activity;
		} catch (error) {
			console.error("Failed to get activity:", error);
			throw new Error("Failed to get activity");
		}
	}

	static async getActivitiesByWorkspace(
		workspaceId: string,
		filters: Omit<ActivityFilters, "workspaceId"> = {},
	): Promise<{
		activities: PrismaActivity[];
		total: number;
	}> {
		return Activity.getActivities({ ...filters, workspaceId });
	}

	static async getActivitiesByUser(
		userId: string,
		filters: Omit<ActivityFilters, "userId"> = {},
	): Promise<{
		activities: PrismaActivity[];
		total: number;
	}> {
		return Activity.getActivities({ ...filters, userId });
	}

	static async getActivitiesByType(
		type: ActivityType | ActivityType[],
		filters: Omit<ActivityFilters, "type"> = {},
	): Promise<{
		activities: PrismaActivity[];
		total: number;
	}> {
		return Activity.getActivities({ ...filters, type });
	}

	static async getActivitiesByDateRange(
		dateFrom: Date,
		dateTo: Date,
		filters: Omit<ActivityFilters, "dateFrom" | "dateTo"> = {},
	): Promise<{
		activities: PrismaActivity[];
		total: number;
	}> {
		return Activity.getActivities({ ...filters, dateFrom, dateTo });
	}

	static async deleteActivity(id: string): Promise<boolean> {
		try {
			await db.activity.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			console.error("Failed to delete activity:", error);
			return false;
		}
	}

	static async updateActivity(
		id: string,
		data: {
			title?: string;
			description?: string;
			color?: ActivityColor;
			type?: ActivityType;
		},
	): Promise<PrismaActivity | null> {
		try {
			const activity = await db.activity.update({
				where: { id },
				data: {
					...data,
					updatedAt: new Date(),
				},
			});

			return activity;
		} catch (error) {
			console.error("Failed to update activity:", error);
			throw new Error("Failed to update activity");
		}
	}

	static async getActivityStats(workspaceId?: string): Promise<{
		totalActivities: number;
		activitiesByType: Record<ActivityType, number>;
		activitiesByColor: Record<ActivityColor, number>;
		recentActivities: number; // last 7 days
	}> {
		try {
			const where = workspaceId ? { workspaceId } : {};
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			const [
				totalActivities,
				activitiesByType,
				activitiesByColor,
				recentActivities,
			] = await Promise.all([
				db.activity.count({ where }),
				db.activity.groupBy({
					by: ["type"],
					where,
					_count: true,
				}),
				db.activity.groupBy({
					by: ["color"],
					where,
					_count: true,
				}),
				db.activity.count({
					where: {
						...where,
						createdAt: {
							gte: sevenDaysAgo,
						},
					},
				}),
			]);

			const typeStats = activitiesByType.reduce(
				(acc, item) => {
					acc[item.type] = item._count;
					return acc;
				},
				{} as Record<ActivityType, number>,
			);

			const colorStats = activitiesByColor.reduce(
				(acc, item) => {
					acc[item.color] = item._count;
					return acc;
				},
				{} as Record<ActivityColor, number>,
			);

			return {
				totalActivities,
				activitiesByType: typeStats,
				activitiesByColor: colorStats,
				recentActivities,
			};
		} catch (error) {
			console.error("Failed to get activity stats:", error);
			throw new Error("Failed to get activity stats");
		}
	}
}
