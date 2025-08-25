export abstract class Logs {
  static async error(message: string) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  }
  static async log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }
}
