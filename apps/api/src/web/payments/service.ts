import { Webhooks } from "@polar-sh/elysia";
import { db } from "database";
import { redirect, status } from "elysia";
import { polar } from "payments";
import { Activity } from "services/activity";
import { Analytics } from "services/analytics";
import type { PaymentsModule } from "./module";

const products = {
	"selfmail-plus": process.env.POLAR_SELFMAIL_PLUS_ID,
	"selfmail-premium": process.env.POLAR_SELFMAIL_PREMIUM_ID,
} as const;

export abstract class PaymentsService {
	static async webhooks() {
		if (!process.env.POLAR_WEBHOOK_SECRET) {
			throw new Error("POLAR_WEBHOOK_SECRET is not set");
		}

		return Webhooks({
			webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
			onPayload: async () => {},
		});
	}
	static async customerPortal({
		userId,
		workspaceId,
	}: PaymentsModule.CustomerPortalParams) {
		const workspace = await db.workspace.findUnique({
			where: { id: workspaceId },
			select: { id: true, name: true, slug: true },
		});

		if (!workspace) {
			throw status(404, "Workspace not found");
		}

		const user = await db.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw status(404, "User not found");
		}

		//Check for required permissions to manage payments
		const hasPermission = await db.memberPermission.findUnique({
			where: {
				memberId_permissionId: {
					memberId: userId,
					permissionId: "manage_payments",
				},
			},
			select: {},
		});

		if (!hasPermission) {
			throw status(403, "You do not have permission to manage payments");
		}

		Analytics.trackEvent("payments.customerPortal", {
			properties: {
				userId,
				workspaceId,
			},
		});

		if (
			process.env.POLAR_PRODUCTION === "sandbox" ||
			(!process.env.POLAR_PRODUCTION && process.env.NODE_ENV === "development")
		) {
			throw redirect(
				`https://sandbox.polar.sh/${process.env.POLAR_ORG_SLUG}/portal`,
			);
		}

		throw redirect(`https://polar.sh/${process.env.POLAR_ORG_SLUG}/portal`);
	}

	static async checkout({
		workspaceId,
		userId,
		product,
	}: PaymentsModule.CheckoutParams) {
		const workspace = await db.workspace.findUnique({
			where: { id: workspaceId },
			select: { id: true, name: true, slug: true },
		});

		if (!workspace) {
			throw status(404, "Workspace not found");
		}

		const user = await db.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true },
		});

		if (!user) {
			throw status(404, "User not found");
		}

		const member = await db.member.findFirst({
			where: {
				userId: user.id,
				workspaceId: workspace.id,
			},
			select: { id: true, profileName: true },
		});

		if (!member) {
			throw status(403, "User is not a member of the workspace");
		}

		Analytics.trackEvent("payments.checkout", {
			properties: {
				userId,
				workspaceId,
			},
		});

		if (!products[product]) {
			throw status(400, "Invalid product specified");
		}

		const url = await polar.checkoutLinks.create({
			productId: products[product],
			paymentProcessor: "stripe",
			successUrl: `${process.env.SELFMAIL_URL}/payments/success`,
		});

		Analytics.trackEvent("payments.checkoutLinkCreated", {
			properties: {
				userId,
				workspaceId,
				product,
			},
		});

		Activity.capture({
			type: "event",
			color: "positive",
			userId,
			workspaceId,
			title: `Checkout link created for ${product}`,
			description: `A checkout link for the ${product === "selfmail-plus" ? "Selfmail Plus" : "Selfmail Premium"} product was created by ${member.profileName ?? user.name}.`,
		});

		throw redirect(url.url);
	}

	static async getCurrentPlan({
		workspaceId,
	}: PaymentsModule.getCurrentPlanQuery) {
		const workspace = await db.workspace.findUnique({
			where: { id: workspaceId },
		});

		if (!workspace) {
			return status(404, "Workspace not found");
		}

		const plan = workspace.billingPlan || "free";

		// Calculate the current usage of the workspace
		const workspaceUsedBytes = await db.email.aggregate({
			_sum: { sizeBytes: true },
			where: {
				address: {
					MemberAddress: {
						some: {
							member: {
								workspaceId: workspace.id,
							},
						},
					},
				},
			},
		});

		return {
			plan,
			planChangedAt: workspace.planChangedAt || null,
			overlimit: workspace.overlimit || false,
			overlimitAt: workspace.overlimitAt || null,
			usedBytes: Number(workspaceUsedBytes?._sum?.sizeBytes || 0),
		};
	}
}
