import { Router } from "express";
import type { Request, Response } from "express";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { z } from "zod";
import { authenticateUserRequestSchema, registerUserRequestSchema } from "./authenticate/schemas.ts";
import { authenticate, register } from "./authenticate/use-cases.ts";

const authRoutes = Router();

authRoutes.post("/login", async (request: Request, response: Response) => {
    const parsed = authenticateUserRequestSchema.safeParse(request.body);

    if (!parsed.success) {
        return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
            message: "Validation Errors",
            ...z.treeifyError(parsed.error),
        });
    }

    const [error, success] = await authenticate(parsed.data);

    if (error) {
        return response.status(error.code).json({ message: error.message });
    }

    return response.status(success.code).json(success.data);
});

authRoutes.post("/register", async (request: Request, response: Response) => {
    const parsed = registerUserRequestSchema.safeParse(request.body);

    if (!parsed.success) {
        return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
            message: "Validation Errors",
            ...z.treeifyError(parsed.error),
        });
    }

    const [error, success] = await register(parsed.data);

    if (error) {
        return response.status(error.code).json({ message: error.message });
    }

    return response.status(success.code).json(success.data);
});

export default authRoutes;
