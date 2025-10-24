import { db } from "database";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

export const PREMIUM_PRODUCT_ID = process.env
	.STRIPE_PREMIUM_PRODUCT_ID as string;

export const checkLimits = async (memberId: string) => {
	const member = await db.member.findUnique({
		where: { id: memberId },
		include: {
			workspace: {
				include: {
					plan: true,
					Member: true,
				},
			},
		},
	});

	if (!member) {
		throw new Error("Member not found");
	}

	const plan = member.workspace.plan;
	const workspace = member.workspace;

	if (!plan || !workspace) {
		throw new Error("Plan not found for workspace");
	}

	return {
		maxSeats: plan.maxSeats,
		currentSeats: workspace.Member.length,

		storageBytesPerSeat: plan.storageBytesPerSeat,
		memberStorageBytes: member.storageBytes,

		addressesPerSeat: plan.addressesPerSeat,
		domainsPerSeat: plan.domainsPerSeat,

		maxDomains: plan.domainsPerSeat * workspace.Member.length,
		currentDomains: await db.domain.count({
			where: {
				workspaceId: workspace.id,
			},
		}),

		maxAddresses: plan.addressesPerSeat * workspace.Member.length,
		currentAddresses: await db.address.count({
			where: {
				MemberAddress: {
					every: {
						member: {
							id: member.id,
						},
					},
				},
			},
		}),
	};
};
