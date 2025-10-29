import type { SMTPServerSession } from "smtp-server";

export type ExtendedSession = SMTPServerSession & {
	meta: {
		dkimVerified?: boolean;
		spamScore?: number;
		spfResult?: string;
	};
};
