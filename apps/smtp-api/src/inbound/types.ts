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
	// manchmal liefert Rspamd zusätzliche Felder:
	scan_time?: number;
	size?: number;
}
