"use server";
import { lucia } from "@/server/lucia";
import bcrypt from "bcrypt";
import { db } from "database";
import { cookies } from "next/headers";
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
		return "Invalid email. Your email must end with @selfmail.app.";
	// checks if the user is already registered
	const checkUser = await db.user.findUnique({
		where: {
			username,
		},
	});

	if (checkUser) return "User already registered. Please login.";

	// create the user
	const user = await db.user.create({
		data: {
			username,
			password: await bcrypt.hash(password, 10),
		},
	});
	// create the main adresse
	const adresse = await db.adresse.create({
		data: {
			email,
			type: "main",
			userId: user.id,
		},
	});

	// all checks done, now the authentication logic
	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	cookies().set("Set-Cookie", sessionCookie.serialize());

	redirect("/");
}
