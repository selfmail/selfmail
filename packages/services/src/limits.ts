import type { PrismaClient } from "@prisma/client";
import { db } from "database";

export abstract class Limits {
	// Returns the left space in bytes for the given member
	static async checkLimit(memberId: string): Promise<bigint> {
		const storage = await db.member.findUnique({
			where: { id: memberId },
			select: {
				storageBytes: true,
				workspaceId: true,
			},
		});

		if (!storage) {
			throw new Error("Storage information not found for member");
		}

		const limits = await db.workspace.findUnique({
			where: { id: storage.workspaceId },
			select: {
				plan: {
					select: {
						storageBytesPerSeat: true,
					},
				},
			},
		});

		if (!limits) {
			throw new Error("Limits information not found for workspace");
		}

		const used = BigInt(storage.storageBytes);
		const total = BigInt(limits.plan.storageBytesPerSeat);

		return total - used;
	}

	// update storage
	static async increaseStorage(
		addressId: string,
		bytes: number,
		tx?: PrismaClient,
	): Promise<void> {
		const transactionClient = tx || db;
		const memberAddress = await transactionClient.address.findUnique({
			where: { id: addressId },
			select: {
				MemberAddress: {
					where: {
						role: "owner",
					},
					select: {
						memberId: true,
					},
				},
			},
		});

		if (
			!memberAddress ||
			memberAddress.MemberAddress.length === 0 ||
			!memberAddress.MemberAddress[0]
		) {
			throw new Error("Member address not found");
		}

		// Check whether the address has multiple owner roles (which is unexpected and not allowed)
		if (memberAddress.MemberAddress.length > 1) {
			throw new Error("Multiple owner addresses found for member");
		}

		await transactionClient.member.update({
			where: { id: memberAddress.MemberAddress[0].memberId },
			data: {
				storageBytes: {
					increment: BigInt(bytes),
				},
			},
		});
	}

	static async decreaseStorage(
		addressId: string,
		bytes: number,
		tx?: PrismaClient,
	): Promise<void> {
		const transactionClient = tx || db;
		const memberAddress = await transactionClient.address.findUnique({
			where: { id: addressId },
			select: {
				MemberAddress: {
					where: {
						role: "owner",
					},
					select: {
						memberId: true,
					},
				},
			},
		});

		if (
			!memberAddress ||
			memberAddress.MemberAddress.length === 0 ||
			!memberAddress.MemberAddress[0]
		) {
			throw new Error("Member address not found");
		}

		// Check whether the address has multiple owner roles (which is unexpected and not allowed)
		if (memberAddress.MemberAddress.length > 1) {
			throw new Error("Multiple owner addresses found for member");
		}

		await transactionClient.member.update({
			where: { id: memberAddress.MemberAddress[0].memberId },
			data: {
				storageBytes: {
					decrement: BigInt(bytes),
				},
			},
		});
	}
}
