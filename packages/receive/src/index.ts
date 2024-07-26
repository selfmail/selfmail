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

export default {
	async email(message, env, ctx): Promise<void> {
		const parser = new PostalMime();
		const email = await parser.parse(message.raw);

		/**
		 * Uploading the content to the server with the unique api key
		 */
	},
} satisfies ExportedHandler<Env>;
