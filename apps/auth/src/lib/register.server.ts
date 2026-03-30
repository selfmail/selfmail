import {
	type ResendRegisterVerificationResult,
	RegisterUtils,
} from "#/utils/register.server";

export type { ResendRegisterVerificationResult };

export const handleRegister = RegisterUtils.handleRegister;
export const resendRegisterVerification = RegisterUtils.resendVerification;
