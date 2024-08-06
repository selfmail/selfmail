/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import PostalMime from 'postal-mime';
import { z } from 'zod';

export default {
	async email(message, env, ctx): Promise<void> {
		const parser = new PostalMime();
		const email = await parser.parse(message.raw);

		/**
		 * Uploading the content to the server with the unique api key.
		 * This happens with a post request to the server. Our api key
		 * (which is set in the wrangler.toml) is accessible with
		 * `env.API_KEY`.
		 */
		const req = await fetch(`https://api.selfmail.app/v1/receive/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.API_KEY}`,
			},
		});

		const data = (await req.json()) as {
			error: string | null;
			message: string | null;
			code: number;
		};
		const parse = await z
			.object({
				error: z.string().nullable(),
				message: z.string().nullable(),
				code: z.number(),
			})
			.safeParseAsync({
				error: data.error,
				message: data.message,
				code: data.code,
			});

		if (!parse.success) {
			message.setReject('Your email was rejected. We had an internal server error. Please contact us here: https://selfmail.app.');
			return;
		}

		const { code, error } = parse.data;
		const msg = parse.data.message;
		// error handling
		if (error) {
			message.setReject(
				`We have an internal server error. Please contact us here: https://selfmail.app. The error: ${error}, code: ${code}`,
			);
		}
	},
} satisfies ExportedHandler<Env>;
