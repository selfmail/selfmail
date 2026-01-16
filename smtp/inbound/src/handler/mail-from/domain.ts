import dns from "node:dns/promises";

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  const parts = email.split("@");
  return parts.length === 2 && parts[1] ? parts[1] : null;
}

/**
 * Verify that a domain exists and can receive email
 */
export async function verifyDomainExists(domain: string): Promise<boolean> {
  try {
    // First try MX records (preferred for email)
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        console.log(
          `[MailFrom] Domain ${domain} has ${mxRecords.length} MX record(s)`
        );
        return true;
      }
    } catch {
      // MX lookup failed, try A record fallback
    }

    // Fallback to A record (some domains receive email without MX)
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        console.log(`[MailFrom] Domain ${domain} has A record (no MX)`);
        return true;
      }
    } catch {
      // A lookup failed
    }

    // Try AAAA record as final fallback
    try {
      const aaaaRecords = await dns.resolve6(domain);
      if (aaaaRecords && aaaaRecords.length > 0) {
        console.log(`[MailFrom] Domain ${domain} has AAAA record (no MX/A)`);
        return true;
      }
    } catch {
      // All lookups failed
    }

    return false;
  } catch (_error) {
    console.error(
      `[MailFrom] Error verifying domain ${domain}: ${_error instanceof Error ? _error.message : "Unknown error"}`
    );
    return false;
  }
}
