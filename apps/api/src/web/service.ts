import { db } from "database";

import type { WebModule } from "./module";

export class WebService {
	async handleRegister({ email, password }: WebModule.RegisterBody) {
		const passwordHash = Bun.hash(password, 10);

		const user = await db;
	}
}
