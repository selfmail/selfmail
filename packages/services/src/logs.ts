import { db } from "database";

export abstract class Logs {
  static async error(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message} ${context ? `\nContext: ${JSON.stringify(context)}` : ""}`);

      return
    }

    const error = await db.error.create({
      data: {
        message,
        stack: context?.stack ? String(context.stack) : undefined,
        context: context ? JSON.stringify(context) : undefined,
      }
    })
  }
  static async log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }
}
