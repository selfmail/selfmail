import dns from "node:dns";
import { promisify } from "node:util";
import { createLogger } from "@selfmail/logging";
import { Ratelimit } from "@selfmail/redis";
import type { SMTPServerSession } from "smtp-server";

/**
 * Checking for rate limiting, reverse DNS, some logic stuff
 * and whether the IP is on some trustfully spam lists.
 */

const logger = createLogger("smtp-inbound-connection");
const rateLimiter = new Ratelimit({
  limit: 100,
  windowSeconds: 3600,
  keyPrefix: "smtp-inbound",
});

export async function validateConnection(
  session: SMTPServerSession,
  callback: (err?: Error) => void
) {
  // Get unique identifier for rate limiting
  const clientAddress = session.remoteAddress || "unknown";

  try {
    // Rate limiting check
    const isRateLimited = await rateLimiter.isRateLimited(clientAddress);
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
      logger.warn(
        `Connection from ${clientAddress} rejected due to failed reverse DNS lookup.`
      );
      return callback(new Error("421 Reverse DNS lookup failed."));
    }

    logger.info(
      `Connection from ${clientAddress} accepted. Hostnames: ${hostnames.join(", ")}`
    );
    return callback();
  } catch (error) {
    logger.error(
      `Error during connection validation for ${clientAddress}: ${error.message}`
    );
    return callback(
      new Error("421 Internal server error during connection validation.")
    );
  }
}
