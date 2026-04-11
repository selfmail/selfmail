import { Authentication } from "@selfmail/authentication";
import {
  authSession,
  getAuthenticationCookies,
  getAuthenticationRequest,
} from "#/utils/authentication.server";

export abstract class SessionUtils {
  static readonly SESSION_COOKIE_NAME = Authentication.SESSION_COOKIE_NAME;
  static readonly TEMP_SESSION_COOKIE_NAME =
    Authentication.TEMP_SESSION_COOKIE_NAME;

  static createBrowserToken() {
    return authSession.createBrowserToken();
  }

  static getCookieDomain(host: string) {
    return authSession.getCookieDomain(host);
  }

  static async hashToken(value: string) {
    return authSession.hashToken(value);
  }

  static async createSession(userId: string) {
    return authSession.createSession({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
      userId,
    });
  }

  static clearSessionCookie() {
    authSession.clearSessionCookie({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
    });
  }

  static setTempSessionCookie(token: string) {
    authSession.setTempSessionCookie({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
      token,
    });
  }

  static getTempSessionCookie() {
    return authSession.getTempSessionCookie({
      cookies: getAuthenticationCookies(),
    });
  }

  static clearTempSessionCookie() {
    authSession.clearTempSessionCookie({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
    });
  }

  static getAppRedirectUrl() {
    return authSession.getAppRedirectUrl({
      request: getAuthenticationRequest(),
    });
  }

  static async getCurrentUser() {
    return authSession.getCurrentUser({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
    });
  }

  static async destroySession() {
    await authSession.destroySession({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
    });
  }
}

export const SESSION_COOKIE_NAME = SessionUtils.SESSION_COOKIE_NAME;
export const TEMP_SESSION_COOKIE_NAME = SessionUtils.TEMP_SESSION_COOKIE_NAME;
