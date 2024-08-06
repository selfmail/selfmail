"use server";

import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * Create a new adress with the given arguments of the formdata.
 */
export async function CreateAdresse(
	prevState: unknown,
	e: FormData,
): Promise<{
	error: string | undefined;
	message: string | undefined;
}> {
	const parse = await z
		.object({
			email: z.string().email().endsWith("@selfmail.app"),
			type: z.enum(["spam", "second"]),
		})
		.safeParseAsync({
			email: e.get("email"),
			type: e.get("type"),
		});
	if (!parse.success) {
		return {
			error: "We are not able to parse the provided fields.",
			message: undefined,
		};
	}
	const { email, type } = parse.data;
	const req = await checkRequest();
	// checking if the email already exists
	const checkEmail = await db.adresse.findUnique({
		where: {
			email,
		},
	});
	if (checkEmail) {
		return {
			error: "The email already exists.",
			message: undefined,
		};
	}
	const adresse = await db.adresse.create({
		data: {
			email,
			type,
			userId: req.userId,
		},
	});
	redirect("/adresse");
}
