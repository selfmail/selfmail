export abstract class Logs {
	static async error(message: string) {
		console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
	}
}
