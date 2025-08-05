export interface EmailData {
	id: string;
	from: string;
	subject: string;
	content: string;
	date: string;
	unread: boolean;
	avatar: string;
}

// API response structure from database
export interface ApiEmailData {
	id: string;
	subject: string;
	body: string;
	html: string | null;
	attachments: string[];
	contactId: string;
	addressId: string;
	date: Date;
}

// Transform API data to EmailData format
export function transformApiEmail(apiEmail: ApiEmailData): EmailData {
	return {
		id: apiEmail.id,
		from: `contact-${apiEmail.contactId.slice(-6)}`, // Using contactId as placeholder for from
		subject: apiEmail.subject,
		content: apiEmail.body,
		date: new Date(apiEmail.date).toISOString(),
		unread: Math.random() > 0.7, // Random unread status as placeholder
		avatar: `U${apiEmail.contactId.slice(-2)}`, // Generate avatar from contactId
	};
}
