import { eq, sql } from "drizzle-orm";
import { db } from "../index.ts";
import { type User, users } from "../schemas/users.ts";
import bcrypt from "bcryptjs";
import { envs } from "@/shared/config/envs.ts";

export const userRepository = () => {
    const getUserByEmail = async (email: User["email"]) => {
        const [user] = await db.select().from(users).where(eq(users.email, email));

        return user;
    };

    const existsUserWithEmail = async (email: User["email"]) => {
        const result = await db
            .select({ one: sql`1` })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result.length > 0;
    };

    const createUser = async ({ email, password, name }: Pick<User, "email" | "password" | "name">) => {
        const hash = bcrypt.hashSync(password, parseInt(envs.PASSWORD_SALT_ROUNDS));

        const result = await db
            .insert(users)
            .values({
                email,
                password: hash,
                name,
            })
            .returning({ id: users.id, email: users.email, name: users.name });

        return result[0];
    };

    return {
        getUserByEmail,
        existsUserWithEmail,
        createUser,
    };
};
