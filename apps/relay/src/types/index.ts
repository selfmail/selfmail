// Types for the relay server

export interface EmailData {
	from: string;
	to: string[];
	cc?: string[];
	bcc?: string[];
	subject: string;
	text?: string;
	html?: string;
	attachments?: Array<{
		filename: string;
		content: string;
		contentType: string;
		cid?: string; // Content-ID for inline attachments
	}>;
}

export interface RelayTarget {
	domain: string;
	priority: number;
	host: string;
	ipv4?: string[];
	ipv6?: string[];
}

export interface CacheEntry<T> {
	data: T;
	expires: number;
}

export interface RelayResult {
	success: boolean;
	relayTargets: RelayTarget[];
	message: string;
}

// Email sending configuration
export interface SMTPConfig {
	host: string;
	port: number;
	secure: boolean;
	auth?: {
		user: string;
		pass: string;
	};
	tls?: {
		rejectUnauthorized: boolean;
	};
}

// Email sending result
export interface SendResult {
	success: boolean;
	messageId?: string;
	accepted: string[];
	rejected: string[];
	error?: string;
}
