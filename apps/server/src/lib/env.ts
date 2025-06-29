import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	HOST: z.string().default("localhost"),
	DATABASE_URL: z.string().min(1, "Database URL is required"),
	CORS_ORIGIN: z.string().optional(),
	UNKEY_API_ID: z.string().optional(),
	UNKEY_ROOT_KEY: z.string().optional(),
	RATE_LIMIT_REQUESTS: z.coerce.number().default(100),
	RATE_LIMIT_WINDOW: z.coerce.number().default(3600),
	JWT_SECRET: z.string().optional(),
	JWT_EXPIRES_IN: z.string().default("7d"),
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.coerce.number().optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		console.error("❌ Invalid environment variables:");
		if (error instanceof z.ZodError) {
			error.errors.forEach((err) => {
				console.error(`  ${err.path.join(".")}: ${err.message}`);
			});
		}
		process.exit(1);
	}
}

export const env = validateEnv();
