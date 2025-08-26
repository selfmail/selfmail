export type RspamdAction =
	| "reject"
	| "soft reject"
	| "rewrite subject"
	| "add header"
	| "greylist"
	| "accept"
	| "discard"
	| string; // fallback, falls Rspamd erweitert wird

export interface RspamdSymbol {
	score: number;
	description?: string;
	options?: string[];
}

export interface RspamdResult {
	action: RspamdAction;
	score: number;
	required_score: number;
	symbols: Record<string, RspamdSymbol>;
	message_id?: string;
	// Additional fields that rspamd may provide:
	scan_time?: number;
	size?: number;
	subject?: string;
	urls?: string[];
	emails?: string[];
	dkim?: {
		valid: boolean;
		domain?: string;
	};
	spf?: {
		result: string;
		domain?: string;
	};
	dmarc?: {
		result: string;
		policy?: string;
	};
}
