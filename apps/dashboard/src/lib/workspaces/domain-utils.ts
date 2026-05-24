import z from "zod";
import { m } from "#/paraglide/messages";

const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const protocolPattern = /^https?:\/\//;
const wwwPattern = /^www\./;
const pathPattern = /\/.*$/;

export const domainError = m["dashboard.settings.domains.invalid"]();

export const toDomainName = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(protocolPattern, "")
		.replace(wwwPattern, "")
		.replace(pathPattern, "");

export const domainNameSchema = z
	.string()
	.transform(toDomainName)
	.pipe(z.string().regex(domainPattern, domainError));

export const domainTxtHost = (domain: string) => `_selfmail.${domain}`;

export const domainTxtValue = (verificationToken: string) =>
	`selfmail-verification=${verificationToken}`;
