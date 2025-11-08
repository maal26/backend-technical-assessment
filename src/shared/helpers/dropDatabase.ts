import { Pool } from "pg";
import "dotenv/config";
import { envs } from "../config/envs.ts";

async function resetTestDatabase() {
    if (envs.NODE_ENV !== "test") {
        return;
    }

    const pool = new Pool({
        connectionString: envs.DATABASE_URL.replace(/\/[^/]+$/, "/postgres"),
    });

    await pool.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1;`, [
        envs.DATABASE_NAME,
    ]);

    await pool.query(`DROP DATABASE IF EXISTS "${envs.DATABASE_NAME}";`);
    await pool.query(`CREATE DATABASE "${envs.DATABASE_NAME}";`);

    await pool.end();
}

resetTestDatabase();
