import { db } from "database";
import { status } from "elysia";
import type { AuthenticationModule } from "./module";

// biome-ignore lint/complexity/noStaticOnlyClass: This class is designed to be static and does not require instantiation.
export abstract class AuthenticationService {
	static async handleRegister({
		email,
		password,
		name,
	}: AuthenticationModule.RegisterBody) {
		const passwordHash = await Bun.password.hash(password, "argon2id");

		const user = await db.user.create({
			data: {
				email,
				password: passwordHash,
				name,
			},
		});

		if (!user) throw status(500);

		// log the user in
	}

	static async handleLogin({
		email,
		password,
	}: AuthenticationModule.LoginBody) {
		const user = await db.user.findUnique({
			where: { email },
		});

		if (!user || !(await Bun.password.verify(user.password, password))) {
			throw new Error("Invalid email or password");
		}

		return user;
	}
}
