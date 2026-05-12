import { afterAll, describe, expect, test } from "bun:test";
import net from "node:net";
import type { SMTPServer } from "smtp-server";

describe("SMTP Inbound Server", () => {
  let server: SMTPServer | null = null;

  afterAll(() => {
    server?.close();
  });

  test("should start the SMTP server", async () => {
    const smtpModule = await import("../src/index");
    server = smtpModule.server;

    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
  });

  test("should have correct server options", async () => {
    const smtpModule = await import("../src/index");
    server = smtpModule.server;

    // Testing server options
    if (process.env.NODE_ENV === "development") {
      expect(server.options.logger).toBe(true);
    } else {
      expect(server.options.logger).toBe(false);
    }

    expect(server.options.disabledCommands).toContain("STARTTLS");
    expect(server.options.disabledCommands).toContain("AUTH");
    expect(server.options.banner).toBe("Welcome to Selfmail SMTP Server");
    expect(typeof server.options.onConnect).toBe("function");
    expect(typeof server.options.onMailFrom).toBe("function");
    expect(typeof server.options.onRcptTo).toBe("function");
    expect(typeof server.options.onData).toBe("function");
  });

  test("should listen on configured port", async () => {
    const smtpModule = await import("../src/index");
    server = smtpModule.server;

    const client = new net.Socket();

    await new Promise<void>((resolve, reject) => {
      client.connect(smtpModule.SMTP_PORT, "localhost", () => {
        client.destroy();
        resolve();
      });

      client.on("error", (err) => {
        reject(err);
      });
    });
  });
});
