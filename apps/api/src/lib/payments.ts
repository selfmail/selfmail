import { Webhooks } from "@polar-sh/elysia";
import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
	server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export abstract class Payments {
	static async createPayment() {}
	static async webhooks() {}
	static async checkPayment() {}
	static async downgradePlan() {}
}
