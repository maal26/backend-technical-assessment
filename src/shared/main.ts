import express from "express";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";

import { envs } from "./config/envs.ts";

import orderRoutes from "../modules/order/routes.ts";
import authRoutes from "../modules/auth/routes.ts";
import { logger } from "./config/logger.ts";

const app = express();

app.use(pinoHttp({
    logger: logger().instance(),
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: envs.NODE_ENV === 'production' ? 50 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

if (envs.NODE_ENV !== "test") {
    app.listen(envs.API_PORT, () => {
        console.log(`server running on port ${envs.API_PORT}`);
    });
}

export { app };
