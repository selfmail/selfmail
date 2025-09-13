"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { auth } from "@/lib/auth";
import { requireUnauthenticated } from "../auth";

const schema = z.object({
	email: z.email(),
	password: z.string().min(8),
	name: z.string().min(2)
});

export const registµer = requireUnauthenticated
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const user = await auth.api.signUpEmail({
			body: {
				email: parsedInput.email,
				password: parsedInput.password,
				name: parsedInput.name,
				rememberMe: true,
			},
		});

		if (!user.user) throw new Error("Failed to register user.");

		return redirect("/");
	});
