import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAddresses() {
	console.log("Seeding test addresses...");

	// First, let's find an existing workspace and member to attach addresses to
	const workspace = await prisma.workspace.findFirst();
	if (!workspace) {
		console.log("No workspace found. Please create a workspace first.");
		return;
	}

	const member = await prisma.member.findFirst({
		where: {
			workspaceId: workspace.id,
		},
	});

	if (!member) {
		console.log("No member found in workspace. Please create a member first.");
		return;
	}

	// Create test addresses
	const testAddresses = [
		"test@example.com",
		"admin@selfmail.dev",
		"support@selfmail.dev",
	];

	for (const email of testAddresses) {
		// Check if address already exists
		const existingAddress = await prisma.address.findUnique({
			where: { email },
		});

		let address: { id: string; email: string };
		if (existingAddress) {
			address = existingAddress;
			console.log(`Address ${email} already exists`);
		} else {
			address = await prisma.address.create({
				data: {
					email,
				},
			});
			console.log(`Created address: ${email}`);
		}

		// Create member-address relationship if it doesn't exist
		const existingMemberAddress = await prisma.memberAddress.findUnique({
			where: {
				memberId_addressId: {
					memberId: member.id,
					addressId: address.id,
				},
			},
		});

		if (!existingMemberAddress) {
			await prisma.memberAddress.create({
				data: {
					memberId: member.id,
					addressId: address.id,
				},
			});
			console.log(`Linked address ${email} to member`);
		} else {
			console.log(`Address ${email} already linked to member`);
		}
	}

	console.log("Seeding completed!");
}

seedAddresses()
	.catch((error) => {
		console.error("Error seeding addresses:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
