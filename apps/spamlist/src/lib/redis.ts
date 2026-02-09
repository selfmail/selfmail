// API

export abstract class Spamlist {
  static async check(ip: string): Promise<boolean> {}
  static async advancedCheck(ip: string): Promise<void> {}

  static async add({}: {}) {}
}
