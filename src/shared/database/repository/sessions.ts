import crypto from 'crypto';
import { db } from '../index.ts';
import { sessions } from '../schemas/sessions.ts';
import { eq } from 'drizzle-orm';

export const sessionRepository = () => {
    const createSession = async (userId: number) => {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2);

        await db.insert(sessions).values({
            userId,
            token: token,
            expiresAt: expiresAt
        });

        return token;
    };

    const removeAllUserSessions = async (userId: number) => {
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }

    return {
        createSession,
        removeAllUserSessions
    };
}