import type { SMTPServerSession } from "smtp-server";

export type SelfmailSmtpSession = SMTPServerSession & {
  envelope: {
    spamScore: number;
    bounceEmail: boolean;
    postmasterEmail: boolean;

    mailboxes: {
      email: string;
      type: string;
      target: string;
    }[];
  };
};
