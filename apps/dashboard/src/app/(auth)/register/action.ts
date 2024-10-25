"use server";
import { getSession } from "@/lib/auth";
import { createId } from '@paralleldrive/cuid2';
import bcrypt from "bcrypt";
import { db } from "database";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { TSignUpSchema } from "./form";

const formDataSchema = z.object({
	username: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(8).max(24),
});

export async function register(e: TSignUpSchema): Promise<string | undefined> {
	const email = e.email;
	const password = e.password;
	const username = e.username;

	const parse = formDataSchema.safeParse({
		email,
		password,
		username,
	});
	if (!parse.success) {
		return "Validation error. Check your email or your password.";
	}
	if (!email.endsWith("@selfmail.app"))
		return "Invalid email. Your first email must end with @selfmail.app. You can add later own domains.";

	// checks if the user is already registered
	const checkUser = await db.user.findUnique({
		where: {
			username,
		},
	});

	if (checkUser) return "Username already registered.";

	// create the user
	const user = await db.user.create({
		data: {
			username,
			password: await bcrypt.hash(password, 10),
			id: createId()
		},
	});

	// create a new personal team for the user
	// create the main adresse
	const personalTeam = await db.team.create({
		data: {
			name: `${username}'s personal team`,
			teamType: "personal",
			ownerId: user.id,
			id: createId()
		}
	})

	// created the personal adress for the user, now log the user in
	const session = await getSession()

	session.userId = user.id
	session.username = user.username

	await session.save()


	redirect(`/team/${personalTeam.id}`);
}
