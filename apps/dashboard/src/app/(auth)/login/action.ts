"use server";
import { lucia } from "@/server/lucia";
import bcrypt from "bcrypt";
import { db } from "database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const formDataSchema = z.object({
	username: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(8).max(24),
});
type Inputs = {
	email: string;
	password: string;
	username: string;
};
export async function login(e: Inputs): Promise<string | undefined> {
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
	// checks if the user exists in the db
	const user = await db.user.findUnique({
		where: {
			username,
		},
	});
	const adresse = await db.adresse.findUnique({
		where: {
			email,
			type: "main",
			userId: user?.id,
		},
	});
	if (!user || !adresse)
		return "User not found. Please check your email and your username.";

	const compare = await bcrypt.compare(password, user.password);
	if (!compare) return "Password is wrong!";
	// all checks done, now the authentication logic
	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	cookies().set("Set-Cookie", sessionCookie.serialize());

	redirect("/");
}
