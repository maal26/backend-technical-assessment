import 'dotenv/config';

import { z } from 'zod';

const envsSchema = z.object({
    API_PORT: z.coerce.number(),
    NODE_ENV: z.enum(['dev', 'production']),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    DRIZZLE_KIT_DATABASE_URL: z.string(),
    DATABASE_URL: z.string(),
    PASSWORD_SALT_ROUNDS: z.string()
});

export const envs = Object.freeze(envsSchema.parse(process.env));