import { db } from "database";

export abstract class Logs {
  static async error(message: string) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);

      return
    }
    // TODO: implement error logging
  }
  static async log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }
}
