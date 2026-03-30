import {
	type VerifyResult,
	VerifyEmailUtils,
} from "#/utils/verify-email.server";

export type { VerifyResult };

export const verifyEmailToken = VerifyEmailUtils.verifyToken;
