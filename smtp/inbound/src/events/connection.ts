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

const hostnameRegex = /^[a-z0-9-]+$/i;
const tldRegex = /^[a-z]{2,}$/i;

export abstract class Connection {
  static async validateIP(ip: string): Promise<boolean> {
    const parse = await z.ipv4().or(z.ipv6()).safeParseAsync(ip);
    return parse.success;
  }

  static validateHostname(hostname: string): boolean {
    if (!hostname || hostname.length > 253) {
      return false;
    }

    const labels = hostname.split(".");
    if (labels.length < 2) {
      return false;
    }

    for (const label of labels) {
      if (
        label.length === 0 ||
        label.length > 63 ||
        label.startsWith("-") ||
        label.endsWith("-") ||
        !hostnameRegex.test(label)
      ) {
        return false;
      }
    }

    const tld = labels.at(-1);
    if (!(tld && tldRegex.test(tld))) {
      return false;
    }

    return true;
  }

  static async checkBlacklists(ip: string): Promise<{
    "spamhaus-zen"?: boolean;
    spamcop?: boolean;
    barracuda?: boolean;
  }> {
    // TODO: implement function
    return {};
  }

  static async init(session: SelfmailSmtpSession, callback: Callback) {
    const clientAddress = session.remoteAddress || "unknown";
    const clientHostname = session.clientHostname;

    // Rate limiting check
    try {
      const isRateLimited = await rateLimiter.check(clientAddress);

      if (isRateLimited.allowed === false) {
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
    const isValidIP = await Connection.validateIP(clientAddress);
    if (!isValidIP) {
      logger.warn(
        `Connection from ${clientAddress} rejected due to invalid IP.`
      );
      session.envelope.spamScore += 5;
    }

    // Hostname validation
    if (clientHostname) {
      const isValidHostname = Connection.validateHostname(clientHostname);
      if (!isValidHostname) {
        logger.warn(
          `Invalid client hostname from ${clientAddress}: ${clientHostname}`
        );
        session.envelope.spamScore += 3;
      }
    }

    // RDNS lookup (only for valid IPs)
    if (isValidIP) {
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
    }

    return callback();
  }

  static async reverseDNSLookup(
    ip: string
  ): Promise<{ ok: true; ptr: string } | { ok: false; ptrs: string[] }> {
    const isIPv6 = ip.includes(":");

    try {
      const ptrs = await Connection.withTimeout(dns.reverse(ip), 5000);

      for (const ptr of ptrs) {
        try {
          const addresses = await Connection.resolveAllAddresses(ptr, isIPv6);
          if (addresses.includes(ip)) {
            return { ok: true, ptr };
          }
        } catch (error) {
          logger.warn(
            `Forward DNS lookup failed for PTR ${ptr}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      logger.warn(
        `No matching forward DNS for IP ${ip}. PTRs: ${ptrs.join(", ")}`
      );
      return { ok: false, ptrs };
    } catch (error) {
      logger.warn(
        `Reverse DNS lookup failed for ${ip}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return { ok: false, ptrs: [] };
    }
  }

  private static async resolveAllAddresses(
    hostname: string,
    preferIPv6: boolean
  ): Promise<string[]> {
    const addresses: string[] = [];

    const resolve = async (
      resolver: () => Promise<string[]>
    ): Promise<void> => {
      try {
        const result = await Connection.withTimeout(resolver(), 5000);
        addresses.push(...result);
      } catch {
        // Ignore resolution failures
      }
    };

    if (preferIPv6) {
      await resolve(() => dns.resolve6(hostname));
      await resolve(() => dns.resolve4(hostname));
    } else {
      await resolve(() => dns.resolve4(hostname));
      await resolve(() => dns.resolve6(hostname));
    }

    return addresses;
  }

  private static withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`DNS timeout after ${ms}ms`)), ms)
      ),
    ]);
  }
}
