import express from "express";
import { envs } from "./config/envs.ts";

import orderRoutes from "../modules/order/routes.ts";
import authRoutes from "../modules/auth/routes.ts";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

app.listen(envs.API_PORT, () => {
    console.log(`server running on port ${envs.API_PORT}`);
});
