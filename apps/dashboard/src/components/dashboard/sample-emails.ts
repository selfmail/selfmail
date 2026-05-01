import type { Email } from "./types";

export const sampleEmails: Email[] = [
  {
    attachments: 2,
    date: "2h ago",
    from: "Selfmail Alerts",
    id: "daily-deliverability-summary",
    initial: "S",
    snippet:
      "Your inbound route accepted 284 messages today with no deferred deliveries.",
    subject: "Daily deliverability summary",
  },
  {
    date: "5h ago",
    from: "Mira from Acme",
    id: "workspace-migration",
    initial: "M",
    read: true,
    snippet:
      "Thanks for the update. The workspace handoff looks clean on our side.",
    subject: "Re: Workspace migration",
  },
  {
    attachments: 1,
    date: "1d ago",
    from: "Billing",
    id: "april-invoice",
    initial: "B",
    read: true,
    snippet:
      "Your invoice and usage details are attached for the current billing period.",
    subject: "April invoice",
  },
];
