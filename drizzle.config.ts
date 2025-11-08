import { envs } from "./src/shared/config/envs";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: ["./src/shared/database/schemas/index.ts"],
    dialect: "postgresql",
    dbCredentials: {
        url: envs.DATABASE_URL,
    },
    migrations: {
        prefix: "timestamp",
    },
    verbose: true,
    strict: true,
});
