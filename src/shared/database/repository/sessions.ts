import crypto from "crypto";
import { db } from "../index.ts";
import { sessions, type Session } from "../schemas/sessions.ts";
import { and, eq, gt } from "drizzle-orm";

export const sessionRepository = () => {
    const createSession = async (userId: number) => {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2);

        await db.insert(sessions).values({
            userId,
            token: token,
            expiresAt: expiresAt,
        });

        return token;
    };

    const removeAllUserSessions = async (userId: number) => {
        await db.delete(sessions).where(eq(sessions.userId, userId));
    };

    const isValidToken = async (token: Session["token"]) => {
        const [session] = await db
            .select({ user_id: sessions.userId, token: sessions.token })
            .from(sessions)
            .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));

        return session;
    };

    return {
        createSession,
        removeAllUserSessions,
        isValidToken,
    };
};
