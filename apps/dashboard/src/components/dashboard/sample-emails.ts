import { m } from "#/paraglide/messages";
import type { Email } from "./types";

export const sampleEmails: Email[] = [
	{
		attachments: 2,
		date: m["dashboard.email.hour_ago"]({ count: 2 }),
		from: m["dashboard.sample_emails.alerts_from"](),
		id: "daily-deliverability-summary",
		initial: "S",
		snippet: m["dashboard.sample_emails.daily_deliverability_snippet"](),
		subject: m["dashboard.sample_emails.daily_deliverability_subject"](),
	},
	{
		date: m["dashboard.email.hour_ago"]({ count: 5 }),
		from: m["dashboard.sample_emails.migration_from"](),
		id: "workspace-migration",
		initial: "M",
		read: true,
		snippet: m["dashboard.sample_emails.migration_snippet"](),
		subject: m["dashboard.sample_emails.migration_subject"](),
	},
	{
		attachments: 1,
		date: m["dashboard.email.day_ago"]({ count: 1 }),
		from: m["dashboard.sample_emails.billing_from"](),
		id: "april-invoice",
		initial: "B",
		read: true,
		snippet: m["dashboard.sample_emails.invoice_snippet"](),
		subject: m["dashboard.sample_emails.invoice_subject"](),
	},
];
