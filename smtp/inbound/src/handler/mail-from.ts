import type { SMTPServerAddress } from "smtp-server";
import z from "zod";
import type { Callback } from "../types";
import type { ExtendedSession } from "../types/session";
import { blocked } from "./mail-from/blocked";
import {
  checkDMARC,
  checkSPF,
  extractDomain,
  handleDMARC,
  performReverseDNSCheck,
  verifyDomainExists,
} from "./mail-from/index";

export abstract class MailFrom {
  private static initializeSession(session: ExtendedSession): void {
    if (session.meta) {
      session.meta.spamScore = 0;
    } else {
      session.meta = {
        spamScore: 0,
      };
    }
  }

  private static async validateAddress(
    address: SMTPServerAddress,
    callback: (err?: Error) => void
  ): Promise<string | null> {
    if (address?.address) {
      console.warn("[MailFrom] Rejected: No email address provided");
      callback(new Error("MAIL FROM rejected: No email address provided"));
      return null;
    }

    const emailAddress = address.address.toLowerCase();
    const emailValidation = await z.email().safeParseAsync(emailAddress);
    if (!emailValidation.success) {
      console.warn(
        `[MailFrom] Rejected: Invalid email address format: ${emailAddress}`
      );
      callback(
        new Error(
          `MAIL FROM rejected: Invalid email address format: ${emailAddress}`
        )
      );
      return null;
    }

    return emailAddress;
  }

  private static async performSecurityChecks(
    emailAddress: string,
    domain: string,
    clientIP: string,
    clientHostname: string,
    callback: (err?: Error) => void
  ): Promise<{
    rDNSResult: Awaited<ReturnType<typeof performReverseDNSCheck>>;
    spfResult: Awaited<ReturnType<typeof checkSPF>>;
    dmarcRecord: Awaited<ReturnType<typeof checkDMARC>>;
  } | null> {
    const isBlocked = await blocked(emailAddress);
    if (isBlocked) {
      console.warn(`[MailFrom] Rejected: Sender is blocked: ${emailAddress}`);
      callback(
        new Error(
          `MAIL FROM rejected: Sender ${emailAddress} is blocked. Contact us to unblock.`
        )
      );
      return null;
    }

    const rDNSResult = await performReverseDNSCheck(clientIP, clientHostname);
    if (!rDNSResult.valid) {
      console.warn(
        `[MailFrom] Warning: rDNS check failed for ${clientIP}: ${rDNSResult.reason}`
      );
    }

    const domainExists = await verifyDomainExists(domain);
    if (!domainExists) {
      console.warn(
        `[MailFrom] Rejected: Domain does not exist or has no MX/A records: ${domain}`
      );
      callback(
        new Error(
          `MAIL FROM rejected: Domain ${domain} does not exist or cannot receive email`
        )
      );
      return null;
    }

    const spfResult = await checkSPF(clientIP, domain, emailAddress);
    console.log(
      `[MailFrom] SPF check for ${emailAddress}: ${spfResult.result} - ${spfResult.reason || "N/A"}`
    );

    const dmarcRecord = await checkDMARC(domain);
    console.log(
      `[MailFrom] DMARC policy for ${domain}: ${dmarcRecord?.policy || "none"}`
    );

    const shouldReject = handleDMARC(spfResult, dmarcRecord, emailAddress);
    if (shouldReject) {
      console.warn(
        `[MailFrom] Rejected: SPF check failed and DMARC policy requires rejection for ${emailAddress}`
      );
      callback(
        new Error(
          `MAIL FROM rejected: SPF validation failed and DMARC policy=${dmarcRecord?.policy || "unknown"}`
        )
      );
      return null;
    }

    return { rDNSResult, spfResult, dmarcRecord };
  }

  private static updateSpamScore(
    session: ExtendedSession,
    spfResult: Awaited<ReturnType<typeof checkSPF>>,
    rDNSResult: Awaited<ReturnType<typeof performReverseDNSCheck>>
  ): void {
    if (spfResult.result === "fail") {
      session.meta.spamScore = (session.meta.spamScore || 0) + 5;
    } else if (spfResult.result === "softfail") {
      session.meta.spamScore = (session.meta.spamScore || 0) + 2;
    }

    if (!rDNSResult.valid) {
      session.meta.spamScore = (session.meta.spamScore || 0) + 1;
    }
  }

  static async init(
    address: SMTPServerAddress,
    session: ExtendedSession,
    callback: (err?: Error) => void
  ): Promise<ReturnType<Callback>> {
    MailFrom.initializeSession(session);

    try {
      const emailAddress = await MailFrom.validateAddress(address, callback);
      if (!emailAddress) {
        return;
      }

      const clientIP = session.remoteAddress || "unknown";
      const clientHostname =
        session.clientHostname || session.hostNameAppearsAs || "unknown";

      console.log(
        `[MailFrom] Processing MAIL FROM: ${emailAddress} from ${clientIP} (${clientHostname})`
      );

      const domain = extractDomain(emailAddress);
      if (!domain) {
        console.warn(
          `[MailFrom] Rejected: Could not extract domain from: ${emailAddress}`
        );
        return callback(
          new Error(`MAIL FROM rejected: Invalid email domain: ${emailAddress}`)
        );
      }

      const securityChecks = await MailFrom.performSecurityChecks(
        emailAddress,
        domain,
        clientIP,
        clientHostname,
        callback
      );
      if (!securityChecks) {
        return;
      }

      const { rDNSResult, spfResult, dmarcRecord } = securityChecks;

      session.meta.spfResult = spfResult.result;

      if (!session.envelope) {
        // biome-ignore lint/suspicious/noExplicitAny: smtp-server envelope type is incomplete
        session.envelope = {} as any;
      }
      // biome-ignore lint/suspicious/noExplicitAny: extending envelope with custom mailFrom property
      (session.envelope as any).mailFrom = {
        address: emailAddress,
        domain,
        rDNS: rDNSResult,
        spf: spfResult,
        dmarc: dmarcRecord,
        timestamp: new Date(),
      };

      MailFrom.updateSpamScore(session, spfResult, rDNSResult);

      console.log(
        `[MailFrom] Accepted MAIL FROM: ${emailAddress} from ${clientIP}`
      );
      return callback();
    } catch (error) {
      console.error(
        `[MailFrom] Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`
      );

      return callback(
        new Error("MAIL FROM rejected: Internal server error during validation")
      );
    }
  }
}
