import { db } from "database";
import { Activity } from "services/activity";

async function seedActivities() {
	console.log("Seeding activity data...");

	// Get the first workspace to seed activities for
	const workspace = await db.workspace.findFirst();

	if (!workspace) {
		console.log("No workspace found. Please create a workspace first.");
		return;
	}

	// Get the first user for the workspace
	const member = await db.member.findFirst({
		where: {
			workspaceId: workspace.id,
		},
	});

	if (!member) {
		console.log(
			"No members found for workspace. Please create a member first.",
		);
		return;
	}

	const activities = [
		{
			title: "Welcome to your workspace",
			description:
				"Your workspace has been successfully created and is ready to use.",
			type: "event" as const,
			color: "positive" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
		},
		{
			title: "First email received",
			description:
				"Your workspace received its first email. Check your inbox to get started.",
			type: "event" as const,
			color: "positive" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
		},
		{
			title: "Setup email forwarding",
			description:
				"Configure email forwarding rules to manage incoming messages effectively.",
			type: "task" as const,
			color: "neutral" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
		},
		{
			title: "Team member invited",
			description: "A new team member was invited to join the workspace.",
			type: "event" as const,
			color: "positive" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
		},
		{
			title: "Backup email server configured",
			description:
				"Secondary email server has been configured for improved reliability.",
			type: "event" as const,
			color: "neutral" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
		},
		{
			title: "Security scan completed",
			description:
				"Weekly security scan completed successfully. No issues found.",
			type: "event" as const,
			color: "positive" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
		},
		{
			title: "Update spam filters",
			description:
				"Review and update spam filtering rules to improve email security.",
			type: "task" as const,
			color: "neutral" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
		},
		{
			title: "Server maintenance scheduled",
			description:
				"Scheduled maintenance will occur tonight between 2-4 AM UTC.",
			type: "reminder" as const,
			color: "neutral" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
		},
		{
			title: "High email volume detected",
			description:
				"Unusual email volume detected. Monitor for potential issues.",
			type: "event" as const,
			color: "negative" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
		},
		{
			title: "Database backup completed",
			description: "Daily database backup completed successfully.",
			type: "event" as const,
			color: "positive" as const,
			workspaceId: workspace.id,
			userId: member.userId,
			createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
		},
	];

	for (const activity of activities) {
		try {
			await Activity.capture(activity);
			console.log(`Created activity: ${activity.title}`);
		} catch (error) {
			console.error(`Failed to create activity "${activity.title}":`, error);
		}
	}

	console.log("Activity seeding completed!");
}

seedActivities()
	.catch(console.error)
	.finally(() => process.exit(0));
