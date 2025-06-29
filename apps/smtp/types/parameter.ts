export type Next = (code?: undefined | null) => void

// types/haraka.ts

export interface ParsedEmail {
    name: (() => string) | string;
    address: string;
}

export interface AddressObject {
    address(): string;
}

export interface Header {
    get(name: string): string | undefined;
}

export interface BodyPart {
    content_type: string;
    bodytext: string;
}

export interface Body {
    bodytext?: string;
    children?: BodyPart[];
}

export interface Transaction {
    parse_body?: boolean;
    mail_from: AddressObject;
    rcpt_to: AddressObject[];
    header: Header;
    body: Body;
}

export interface Connection {
    transaction: Transaction;
    remote: {
        ip: string;
        host: string;
    };
    notes: Record<string, any>;
}
