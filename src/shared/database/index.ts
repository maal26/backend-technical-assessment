import { envs } from "../config/envs.ts";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schemas/index.ts";

export const db = drizzle(envs.DATABASE_URL!, {
    schema,
    logger: envs.NODE_ENV === "dev",
});
