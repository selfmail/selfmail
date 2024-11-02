// https://www.robinwieruch.de/how-to-roll-your-own-auth/

import { sha256 } from "@oslojs/crypto/sha2";
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";

import { db } from "database";


export const generateRandomSessionToken = () => {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
};


const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2;  // 30 days

const fromSessionTokenToSessionId = (sessionToken: string) => {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
};


export const createSession = async (sessionToken: string, userId: string) => {
    const sessionId = fromSessionTokenToSessionId(sessionToken);

    const session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
    };


    await db.session.create({
        data: session,
    });

    return session;
};


export const validateSession = async (sessionToken: string) => {
    const sessionId = fromSessionTokenToSessionId(sessionToken);

    console.log(`session id: ${sessionId}`)

    const result = await db.session.findUnique({
        where: {
            id: sessionId,
        },
        include: {
            user: true,
        },
    });

    console.log(`Result of fetch: ${result}`)



    // if there is no session, return null
    if (!result) {
        return { session: null, user: null };
    }

    const { user, ...session } = result;

    // if the session is expired, delete it
    if (Date.now() >= session.expiresAt.getTime()) {
        // or your ORM of choice
        await db.session.delete({
            where: {
                id: sessionId,
            },
        });

        return { session: null, user: null };
    }

    // if 15 days are left until the session expires, refresh the session
    if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS) {
        session.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);

        // or your ORM of choice
        await db.session.update({
            where: {
                id: sessionId,
            },
            data: {
                expiresAt: session.expiresAt,
            },
        });
    }

    return { session, user };
};
export const invalidateSession = async (sessionId: string) => {
    // or your ORM of choice
    await db.session.delete({
        where: {
            id: sessionId,
        },
    });
};