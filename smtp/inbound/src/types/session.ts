import type { SMTPServerSession } from "smtp-server";

export type SelfmailSmtpSession = SMTPServerSession & {
  envelope: {
    spamScore: number;
  };
};
