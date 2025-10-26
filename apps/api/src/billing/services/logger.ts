/**
 * Simple logging service for billing operations
 * TODO: Replace with proper logging service when services/logs is available
 */
export const BillingLogger = {
	log: (message: string, context?: Record<string, unknown>) => {
		console.log(
			`[BILLING-LOG] ${new Date().toISOString()}: ${message}`,
			context || {},
		);
	},

	error: async (message: string, context?: Record<string, unknown>) => {
		console.error(
			`[BILLING-ERROR] ${new Date().toISOString()}: ${message}`,
			context || {},
		);
		// TODO: Persist to database error log when available
	},

	info: (message: string, context?: Record<string, unknown>) => {
		console.info(
			`[BILLING-INFO] ${new Date().toISOString()}: ${message}`,
			context || {},
		);
	},

	warn: (message: string, context?: Record<string, unknown>) => {
		console.warn(
			`[BILLING-WARN] ${new Date().toISOString()}: ${message}`,
			context || {},
		);
	},
};
