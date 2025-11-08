import { Router } from "express";
import type { Request, Response } from "express";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { z } from "zod";
import { createOrderRequestSchema } from "./create-orders/schemas.ts";
import { verifyToken } from "@/modules/auth/middleware/verify-token.ts";
import { createOrder } from "./create-orders/use-cases.ts";
import { getOrders } from "./get-orders/use-cases.ts";
import { getOrdersRequestSchema } from "./get-orders/schemas.ts";
import { getOrder } from "./get-order/use-cases.ts";
import { deleteOrder } from "./delete-order/use-cases.ts";

const orderRoutes = Router();

orderRoutes.get("/", verifyToken, async (request: Request, response: Response) => {
    const parsed = getOrdersRequestSchema.safeParse(request.query);

    if (!parsed.success) {
        return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
            message: "Validation Errors",
            ...z.treeifyError(parsed.error),
        });
    }

    const [, success] = await getOrders({ status: parsed.data.status, userId: request.userId as number });

    return response.status(success.code).json(success.data);
});

orderRoutes.get("/:id", verifyToken, async (request: Request, response: Response) => {
    const [error, success] = await getOrder({
        userId: request.userId as number,
        orderId: parseInt(request.params.id),
    });

    if (error) {
        return response.status(error.code).json({
            message: error.message,
        });
    }

    return response.status(success.code).json(success.data);
});

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

orderRoutes.delete("/:id", verifyToken, async (request: Request, response: Response) => {
    const [error, success] = await deleteOrder({
        userId: request.userId as number,
        orderId: parseInt(request.params.id),
    });

    if (error) {
        return response.status(error.code).json({
            message: error.message,
        });
    }

    return response.status(success.code).json(success.data);
});

export default orderRoutes;
