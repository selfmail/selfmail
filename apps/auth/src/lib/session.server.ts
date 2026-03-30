import { SessionUtils } from "#/utils/session.server";

export const SESSION_COOKIE_NAME = SessionUtils.SESSION_COOKIE_NAME;
export const TEMP_SESSION_COOKIE_NAME = SessionUtils.TEMP_SESSION_COOKIE_NAME;

export const createBrowserToken = SessionUtils.createBrowserToken;
export const hashToken = SessionUtils.hashToken;
export const createSession = SessionUtils.createSession;
export const clearSessionCookie = SessionUtils.clearSessionCookie;
export const setTempSessionCookie = SessionUtils.setTempSessionCookie;
export const getTempSessionCookie = SessionUtils.getTempSessionCookie;
export const clearTempSessionCookie = SessionUtils.clearTempSessionCookie;
export const getAppRedirectUrl = SessionUtils.getAppRedirectUrl;
export const getCurrentUser = SessionUtils.getCurrentUser;
export const destroySession = SessionUtils.destroySession;
