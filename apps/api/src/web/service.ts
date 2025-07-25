import { db } from "database";

import type { WebModule } from "./module";

export class WebService {
	async handleRegister({ email, password }: WebModule.RegisterBody) {
		const passwordHash = Bun.hash(password, 10);

		const user = await db.user.create({
			data: {
				email,
				password: passwordHash,
			},
		});
	}

	async handleLogin({ email, password }: WebModule.LoginBody) {
		const user = await db.user.findUnique({
			where: { email },
		});

		if (!user || !Bun.verifyHash(user.password, password)) {
			throw new Error("Invalid email or password");
		}

		return user;
	}
}
