import { Router } from "express";
import type { Request, Response } from "express";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { z } from "zod";
import { authenticateUserRequestSchema, registerUserRequestSchema } from "./authenticate/schemas.ts";
import { authenticate, register } from "./authenticate/use-cases.ts";
import { logger } from "@/shared/config/logger.ts";

const authRoutes = Router();

authRoutes.post("/login", async (request: Request, response: Response) => {
    try {
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
    } catch (error) {
        logger().error("Auth Login", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

authRoutes.post("/register", async (request: Request, response: Response) => {
    try {
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
    } catch (error) {
        logger().error("Auth Register", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

export default authRoutes;
