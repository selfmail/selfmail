import { createLogger } from "@selfmail/logging";
import type { SMTPServerSession } from "smtp-server";
import { rspamd } from "../lib/rspamd";
import type { Callback } from "../types";

const logger = createLogger("smtp-inbound-connection");

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
const fqdnPattern = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.?$/;

export abstract class Connection {
  static readonly PRIVATE_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/,
    /^fc00:/,
    /^fd00:/,
  ];

  static async init(
    session: SMTPServerSession,
    callback: Callback
  ): Promise<ReturnType<Callback>> {
    try {
      if (!session.remoteAddress) {
        logger.warn("Connection rejected: No remote address");
        return callback(new Error("Connection rejected: No remote address"));
      }

      const clientIP = session.remoteAddress;
      const clientHostname =
        session.clientHostname || session.hostNameAppearsAs || "unknown";

      logger.info("New connection", {
        clientIP,
        clientHostname,
      });

      if (Connection.isPrivateIP(clientIP)) {
        logger.warn("Connection rejected: Private IP", {
          clientIP,
        });
        return callback(
          new Error(
            "Connection rejected: Connections from private networks are not allowed"
          )
        );
      }

      if (clientHostname && !Connection.isValidHostname(clientHostname)) {
        logger.warn("Invalid HELO/EHLO hostname", {
          clientHostname,
        });
      }

      try {
        const rspamdResult = await rspamd.checkConnection({
          ip: clientIP,
          helo: clientHostname !== "unknown" ? clientHostname : undefined,
        });

        logger.debug("Rspamd check result", {
          action: rspamdResult.action,
          score: rspamdResult.score,
          clientIP,
        });

        if (!rspamdResult.allowed) {
          logger.warn("Connection rejected by Rspamd", {
            action: rspamdResult.action,
            reason: rspamdResult.reason,
            clientIP,
          });
          return callback(
            new Error(
              `Connection rejected: ${rspamdResult.reason || "Spam protection triggered"}`
            )
          );
        }

        if (rspamdResult.score > 0) {
          logger.warn("Connection allowed with elevated spam score", {
            score: rspamdResult.score,
            reason: rspamdResult.reason,
            clientIP,
          });
        }
      } catch (rspamdError) {
        logger.error(
          "Rspamd check failed",
          rspamdError instanceof Error ? rspamdError : undefined,
          { clientIP }
        );
      }

      logger.info("Connection accepted", { clientIP });
      return callback();
    } catch (error) {
      logger.error(
        "Unexpected error during connection check",
        error instanceof Error ? error : undefined
      );
      return callback(new Error("Connection rejected: Internal server error"));
    }
  }

  static isPrivateIP(ip: string): boolean {
    return Connection.PRIVATE_IP_RANGES.some((pattern) => pattern.test(ip));
  }

  static isValidHostname(hostname: string): boolean {
    if (!hostname || hostname === "unknown") {
      return false;
    }

    if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
      return true;
    }

    return fqdnPattern.test(hostname) && hostname.includes(".");
  }
}
