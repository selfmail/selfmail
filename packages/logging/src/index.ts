import { Axiom } from "@axiomhq/js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

interface LogOptions {
  level?: LogLevel;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private readonly axiom: Axiom | null = null;
  private readonly dataset: string;
  private readonly service: string;
  private readonly enabled: boolean;

  constructor(service: string, dataset = "selfmail") {
    this.service = service;
    this.dataset = dataset;
    this.enabled = !!process.env.AXIOM_TOKEN && !!process.env.AXIOM_ORG_ID;

    if (this.enabled && process.env.AXIOM_TOKEN && process.env.AXIOM_ORG_ID) {
      this.axiom = new Axiom({
        token: process.env.AXIOM_TOKEN,
        orgId: process.env.AXIOM_ORG_ID,
      });
    }
  }

  private send(
    level: LogLevel,
    message: string,
    options: LogOptions = {}
  ): void {
    const timestamp = new Date().toISOString();

    const logEntry = {
      _time: timestamp,
      level,
      service: this.service,
      message,
      ...options.context,
      ...(options.error && {
        error: {
          name: options.error.name,
          message: options.error.message,
          stack: options.error.stack,
        },
      }),
    };

    const consoleMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.service}] ${message}`;

    switch (level) {
      case "debug":
        console.debug(consoleMessage, options.context || "");
        break;
      case "info":
        console.info(consoleMessage, options.context || "");
        break;
      case "warn":
        console.warn(consoleMessage, options.context || "");
        break;
      case "error":
        console.error(consoleMessage, options.error || options.context || "");
        break;
      default:
        console.log(consoleMessage, options.context || "");
    }

    if (this.axiom) {
      try {
        this.axiom.ingest(this.dataset, [logEntry]);
      } catch (error) {
        console.error("Failed to send log to Axiom:", error);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.send("debug", message, { level: "debug", context });
  }

  info(message: string, context?: LogContext): void {
    this.send("info", message, { level: "info", context });
  }

  warn(message: string, context?: LogContext): void {
    this.send("warn", message, { level: "warn", context });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.send("error", message, { level: "error", error, context });
  }

  async flush(): Promise<void> {
    if (this.axiom) {
      try {
        await this.axiom.flush();
      } catch (error) {
        console.error("Failed to flush logs to Axiom:", error);
      }
    }
  }
}

export const createLogger = (service: string, dataset?: string): Logger =>
  new Logger(service, dataset);

export type { Logger };
