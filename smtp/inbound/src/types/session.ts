import type { SMTPServerSession } from "smtp-server";

export type SPFResult =
	| "pass"
	| "fail"
	| "softfail"
	| "neutral"
	| "none"
	| "temperror"
	| "permerror";

export type DMARCPolicy = "none" | "quarantine" | "reject";

export type SPFCheckResult = {
	result: SPFResult;
	reason?: string;
	mechanism?: string;
};

export type DMARCRecord = {
	policy: DMARCPolicy;
	subdomainPolicy?: DMARCPolicy;
	percentage?: number;
	aspf?: "r" | "s";
	adkim?: "r" | "s";
	raw?: string;
};

export type ReverseDNSResult = {
	valid: boolean;
	hostname?: string;
	reason?: string;
};

export type MailFromData = {
	address: string;
	domain: string;
	rDNS: ReverseDNSResult;
	spf: SPFCheckResult;
	dmarc: DMARCRecord | null;
	timestamp: Date;
};

export type RspamdResult = {
	action:
		| "reject"
		| "add header"
		| "rewrite subject"
		| "greylist"
		| "no action";
	score: number;
	required_score: number;
	symbols?: Record<string, { score: number; options?: string[] }>;
	rewriteSubject?: string;
};

export type EmailData = {
	raw: string;
	size: number;
	subject?: string;
	messageId?: string;
	date?: string;
	rspamd: RspamdResult;
};

export type ExtendedSession = SMTPServerSession & {
	meta: {
		dkimVerified?: boolean;
		spamScore: number;
		spfResult?: SPFResult;
		rspamdResult?: RspamdResult;
	};
	envelope: SMTPServerSession["envelope"] & {
		mailFrom?: MailFromData;
		emailData?: EmailData;
	};
};
