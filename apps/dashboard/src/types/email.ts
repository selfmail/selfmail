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
	read: boolean;
	readAt: Date | null;
}

// Transform API data to EmailData format
export function transformApiEmail(apiEmail: ApiEmailData): EmailData {
	return {
		id: apiEmail.id,
		from: `contact-${apiEmail.contactId.slice(-6)}`, // Using contactId as placeholder for from
		subject: apiEmail.subject,
		content: apiEmail.body,
		date: new Date(apiEmail.date).toISOString(),
		unread: !apiEmail.read, // Use real read status from database
		avatar: `U${apiEmail.contactId.slice(-2)}`, // Generate avatar from contactId
	};
}
