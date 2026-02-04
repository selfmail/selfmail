import dns from "node:dns";
import { promisify } from "node:util";
import { createLogger } from "@selfmail/logging";
import { RateLimitRedisError, Ratelimit } from "@selfmail/redis";
import z from "zod";
import type { Callback } from "../types";
import type { SelfmailSmtpSession } from "../types/session";

/**
 * Checking for rate limiting, reverse DNS, some logic stuff
 * and whether the IP is on some trustfully spam lists.
 *
 * TODO: Implement spam list checking.
 */

const logger = createLogger("smtp-inbound-connection");
const rateLimiter = new Ratelimit({
  limit: 100,
  windowSeconds: 3600,
  keyPrefix: "smtp-inbound",
});

export abstract class Connection {
  static async validateIP(ip: string): Promise<boolean> {
    const parse = await z.ipv4().or(z.ipv6()).safeParseAsync(ip);
    return parse.success;
  }

  static async init(session: SelfmailSmtpSession, callback: Callback) {
    const clientAddress = session.remoteAddress || "unknown";

    // Rate limiting check
    try {
      const isRateLimited = await rateLimiter.check(clientAddress);

      if (isRateLimited) {
        logger.warn(
          `Connection from ${clientAddress} rejected due to rate limiting.`
        );
        return callback(
          new Error("421 Too many connections, please try again later.")
        );
      }
    } catch (e) {
      if (e instanceof RateLimitRedisError) {
        logger.error(
          `Redis error during rate limiting for ${clientAddress}: ${e.message}`
        );
      }
      return callback(
        new Error("421 Internal server error during connection validation.")
      );
    }

    // IP validation
    try {
      const isValidIP = await Connection.validateIP(clientAddress);
      if (!isValidIP) {
        logger.warn(
          `Connection from ${clientAddress} rejected due to invalid IP.`
        );
        return callback(new Error("421 Invalid IP address."));
      }
    } catch (error) {
      logger.error(
        `Error during IP validation for ${clientAddress}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return callback(
        new Error("421 Internal server error during IP validation.")
      );
    }

    // Reverse DNS lookup
  }
}

export async function validateConnection(
  session: SelfmailSmtpSession,
  callback: (err?: Error) => void
) {
  // Get unique identifier for rate limiting
  const clientAddress = session.remoteAddress || "unknown";

  try {
    // Rate limiting check
    const isRateLimited = await rateLimiter.check(clientAddress);

    if (isRateLimited) {
      logger.warn(
        `Connection from ${clientAddress} rejected due to rate limiting.`
      );
      return callback(
        new Error("421 Too many connections, please try again later.")
      );
    }

    // Reverse DNS lookup
    const reverseLookup = promisify(dns.reverse);
    const hostnames = await reverseLookup(clientAddress).catch(() => []);
    if (hostnames.length === 0) {
      session.envelope.spamScore += 2;
    }

    logger.info(
      `Connection from ${clientAddress} accepted. Hostnames: ${hostnames.join(", ")}`
    );
    return callback();
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `Error during connection validation for ${clientAddress}: ${error.message}`
      );
    } else {
      logger.error(
        `Unknown error during connection validation for ${clientAddress}.`
      );
    }

    return callback(
      new Error("421 Internal server error during connection validation.")
    );
  }
}
