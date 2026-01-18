import dns from "node:dns";
import { promisify } from "node:util";
import { createLogger } from "@selfmail/logging";
import { Ratelimit } from "@selfmail/redis";
import type { SMTPServerSession } from "smtp-server";

const logger = createLogger("smtp-inbound-connection");
const rateLimiter = new Ratelimit({
  limit: 100,
  windowSeconds: 3600,
  keyPrefix: "smtp-inbound",
});

const reverseLookup = promisify(dns.reverse);
const resolveDns = promisify(dns.resolve4);

const SUSPICIOUS_HELO_PATTERNS = [
  /^\d+\.\d+\.\d+\.\d+$/,
  /^(localhost|unknown|server|mail)$/i,
  /\.(local|lan|internal)$/i,
];

const DNSBL_PROVIDERS = [
  { host: "zen.spamhaus.org", name: "Spamhaus ZEN" },
  { host: "bl.spamcop.net", name: "SpamCop" },
  { host: "dnsbl.sorbs.net", name: "SORBS" },
  { host: "b.barracudacentral.org", name: "Barracuda" },
] as const;

async function checkReverseDNS(
  ip: string
): Promise<{ valid: boolean; hostname?: string; error?: string }> {
  try {
    const hostnames = await reverseLookup(ip);

    if (!hostnames || hostnames.length === 0) {
      return { valid: false, error: "No reverse DNS record found" };
    }

    const hostname = hostnames[0];

    if (!hostname) {
      return { valid: false, error: "Empty hostname returned" };
    }

    const forwardIPs = await resolveDns(hostname);

    if (forwardIPs.includes(ip)) {
      return { valid: true, hostname };
    }

    return {
      valid: false,
      error: "Reverse DNS does not match forward DNS",
      hostname,
    };
  } catch {
    return { valid: false, error: "DNS lookup failed" };
  }
}

async function checkDNSBL(
  ip: string
): Promise<{ blocked: boolean; provider?: string }> {
  const reversedIP = ip.split(".").reverse().join(".");

  for (const provider of DNSBL_PROVIDERS) {
    try {
      const query = `${reversedIP}.${provider.host}`;
      await resolveDns(query);

      return { blocked: true, provider: provider.name };
    } catch {
      // IP not listed on this DNSBL, continue checking other providers
    }
  }

  return { blocked: false };
}

function detectSpamPatterns(session: SMTPServerSession): {
  isSpam: boolean;
  reason?: string;
} {
  const ip = session.remoteAddress;

  if (!ip) {
    return { isSpam: true, reason: "No remote address provided" };
  }

  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return { isSpam: false };
  }

  if (!session.hostNameAppearsAs) {
    return { isSpam: true, reason: "No HELO/EHLO hostname provided" };
  }

  for (const pattern of SUSPICIOUS_HELO_PATTERNS) {
    if (pattern.test(session.hostNameAppearsAs)) {
      return {
        isSpam: true,
        reason: `Suspicious HELO/EHLO hostname: ${session.hostNameAppearsAs}`,
      };
    }
  }

  return { isSpam: false };
}

export async function validateConnection(
  session: SMTPServerSession,
  callback: (err?: Error | null) => void
): Promise<void> {
  const ip = session.remoteAddress || "unknown";

  try {
    const rateLimitResult = await rateLimiter.check(`connection:${ip}`);

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil(
        (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
      );
      const error = new Error(
        `Rate limit exceeded. Try again in ${resetInSeconds} seconds`
      );
      error.name = "RateLimitError";
      logger.warn("Rate limit exceeded", {
        ip,
        remaining: rateLimitResult.remaining,
      });
      return callback(error);
    }

    const spamCheck = detectSpamPatterns(session);
    if (spamCheck.isSpam) {
      const error = new Error(`Connection rejected: ${spamCheck.reason}`);
      error.name = "SpamDetectionError";
      logger.warn("Spam pattern detected", { ip, reason: spamCheck.reason });
      return callback(error);
    }

    if (
      ip !== "127.0.0.1" &&
      ip !== "::1" &&
      !ip.startsWith("192.168.") &&
      !ip.startsWith("10.")
    ) {
      const rdnsResult = await checkReverseDNS(ip);
      if (rdnsResult.valid) {
        logger.info("Reverse DNS validated", {
          ip,
          hostname: rdnsResult.hostname,
        });
      } else {
        logger.warn("Reverse DNS validation failed", {
          ip,
          error: rdnsResult.error,
        });
      }

      const dnsblResult = await checkDNSBL(ip);
      if (dnsblResult.blocked) {
        const error = new Error(
          `Connection rejected: IP ${ip} is listed on ${dnsblResult.provider}`
        );
        error.name = "DNSBLError";
        logger.warn("IP blocked by DNSBL", {
          ip,
          provider: dnsblResult.provider,
        });
        return callback(error);
      }
    }

    logger.info("Connection accepted", {
      ip,
      helo: session.hostNameAppearsAs || "none",
    });
    return callback(null);
  } catch (error) {
    logger.error(
      "Connection validation error",
      error instanceof Error ? error : undefined,
      { ip }
    );
    const err = new Error("Internal server error during connection validation");
    err.name = "ValidationError";
    return callback(err);
  }
}
