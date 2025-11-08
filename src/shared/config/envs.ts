import "dotenv/config";

import { z } from "zod";

const envsSchema = z.object({
    API_PORT: z.coerce.number(),
    NODE_ENV: z.enum(["dev", "production", "test"]),
    DATABASE_NAME: z.string(),
    DATABASE_URL: z.string(),
    PASSWORD_SALT_ROUNDS: z.string(),
});

export const envs = Object.freeze(envsSchema.parse(process.env));
