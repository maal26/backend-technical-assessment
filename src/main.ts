import express from "express";
import { envs } from "./shared/config/envs.ts";

import authRoutes from "./modules/auth/authenticate/routes.ts";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(envs.API_PORT, () => {
    console.log(`server running on port ${envs.API_PORT}`);
});
