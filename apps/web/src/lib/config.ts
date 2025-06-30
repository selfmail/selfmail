// Environment configuration for the web app
interface AppConfig {
	serverUrl: string;
	appName: string;
	appVersion: string;
	apiTimeout: number;
	enableDevTools: boolean;
	enableAnalytics: boolean;
	nodeEnv: string;
}

function getConfig(): AppConfig {
	return {
		serverUrl: import.meta.env.VITE_SERVER_URL,
		appName: import.meta.env.VITE_APP_NAME || "Selfmail",
		appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
		apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
		enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === "true",
		enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
		nodeEnv:
			import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || "development",
	};
}

export const config = getConfig();

// Type-safe environment access
export const env = {
	isDev: config.nodeEnv === "development",
	isProd: config.nodeEnv === "production",
	isTest: config.nodeEnv === "test",
} as const;
