import { Router } from "express";
import type { Request, Response } from "express";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { z } from "zod";
import { createOrderRequestSchema } from "./schemas.ts";
import { verifyToken } from "@/modules/auth/middleware/verify-token.ts";
import { createOrder } from "./use-cases.ts";

const orderRoutes = Router();

orderRoutes.post("/", verifyToken, async (request: Request, response: Response) => {
    const parsed = createOrderRequestSchema.safeParse(request.body);

    if (!parsed.success) {
        return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
            message: "Validation Errors",
            ...z.treeifyError(parsed.error),
        });
    }

    const [error, success] = await createOrder({ items: parsed.data.items, userId: request.userId as number });

    if (error) {
        return response.status(error.code).json({ message: error.message });
    }

    return response.status(success.code).json(success.data);
});

export default orderRoutes;
