import dns from "node:dns/promises";
import { createLogger } from "@selfmail/logging";
import { RateLimitRedisError, Ratelimit } from "@selfmail/redis";
import z from "zod";
import type { Callback } from "../types";
import type { SelfmailSmtpSession } from "../types/session";

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
        session.envelope.spamScore += 5;
      }
    } catch (error) {
      logger.error(
        `Error during IP validation for ${clientAddress}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      session.envelope.spamScore += 5;
    }

    // RDNS lookup
    try {
      const rdnsResult = await Connection.reverseDNSLookup(clientAddress);
      if (rdnsResult.ok) {
        logger.info(
          `Valid reverse DNS for ${clientAddress}: ${rdnsResult.ptr}`
        );
      } else {
        logger.info(
          `No valid reverse DNS for ${clientAddress}. PTRs: ${rdnsResult.ptrs.join(", ")}`
        );
        session.envelope.spamScore += 2;
      }
    } catch (error) {
      logger.error(
        `Error during reverse DNS lookup for ${clientAddress}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      session.envelope.spamScore += 2;
    }

    return callback();
  }
  static async reverseDNSLookup(
    ip: string
  ): Promise<{ ok: true; ptr: string } | { ok: false; ptrs: string[] }> {
    try {
      const ptrs = await dns.reverse(ip);
      for (const ptr of ptrs) {
        try {
          const fwd = await dns.lookup(ptr);
          if (fwd.address === ip) {
            return { ok: true, ptr };
          }
        } catch {
          // Ignore lookup failures and continue to next PTR record
        }
      }
      return { ok: false, ptrs };
    } catch {
      return { ok: false, ptrs: [] };
    }
  }
}
