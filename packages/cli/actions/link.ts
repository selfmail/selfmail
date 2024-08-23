import terminalLink from "terminal-link";

export function link(name: string, url: string): string {
    if (!terminalLink.isSupported) {
        return `${name} (${url})`
    }
    return terminalLink(name, url);
}