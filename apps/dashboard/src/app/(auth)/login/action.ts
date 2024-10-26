"use server";
import { notAuthenticatedClient } from "@/lib/actions/auth.action";
import { changeSession } from "@/lib/auth";
import bcrypt from "bcrypt";
import { db } from "database";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginScheme = z.object({
	username: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(8).max(24),
});

type Inputs = {
	email: string;
	password: string;
	username: string;
};

export const loginUser = notAuthenticatedClient.schema(loginScheme).action(async ({ parsedInput: { username, password, email } }) => {
	// checks if the user exists in the db
	const user = await db.user.findUnique({
		where: {
			username,
		},
	});

	if (!user)
		return "User not found. Please check your email and your username.";

	const compare = await bcrypt.compare(password, user.password);
	if (!compare) return "Password is wrong!";

	// edit the session

	await changeSession({
		userId: user.id,
		username: user.username
	})

	redirect("/");
});

