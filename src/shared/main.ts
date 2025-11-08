import express from "express";
import { envs } from "./config/envs.ts";

import orderRoutes from "../modules/order/routes.ts";
import authRoutes from "../modules/auth/routes.ts";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

if (envs.NODE_ENV !== "test") {
    app.listen(envs.API_PORT, () => {
        console.log(`server running on port ${envs.API_PORT}`);
    });
}

export { app };
