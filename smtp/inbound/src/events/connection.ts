import dns from "node:dns";
import { promisify } from "node:util";
import { createLogger } from "@selfmail/logging";
import { Ratelimit } from "@selfmail/redis";
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
