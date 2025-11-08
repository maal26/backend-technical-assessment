import crypto from "crypto";
import { db } from "@/shared/database/index.ts";
import { users } from "@/shared/database/schemas/users.ts";
import { sessions } from "@/shared/database/schemas/sessions.ts";
import { envs } from "../config/envs.ts";

export async function createSessionToken() {
    if (envs.NODE_ENV !== "test") {
        return "";
    }

    const uuid = crypto.randomBytes(32).toString("hex");
    const randomNumber = Math.random().toString(36).slice(2);

    const [user] = await db
        .insert(users)
        .values({
            name: `User ${randomNumber}`,
            email: `user-${randomNumber}@mail.com`,
            password: "password",
        })
        .returning();

    const [session] = await db
        .insert(sessions)
        .values({
            userId: user.id,
            token: uuid,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .returning();

    return [session.token, user.id];
}
