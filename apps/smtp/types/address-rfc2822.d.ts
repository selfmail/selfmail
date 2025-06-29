declare module 'address-rfc2822' {
    export interface ParsedAddress {
        address: string;
        name?: (() => string) | string ;
        local?: string;
        domain?: string;
    }

    export function parse(address: string): ParsedAddress[];
} 