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
import { updateOrderStatusSchema } from "./update-order/schemas.ts";
import { updateOrderStatus } from "./update-order/use-cases.ts";
import { logger } from "@/shared/config/logger.ts";

const orderRoutes = Router();

export const idParamSchema = z.object({
    id: z.coerce.number().int(),
});

orderRoutes.get("/", verifyToken, async (request: Request, response: Response) => {
    try {
        const parsed = getOrdersRequestSchema.safeParse(request.query);

        if (!parsed.success) {
            return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
                message: "Validation Errors",
                ...z.treeifyError(parsed.error),
            });
        }

        const [, success] = await getOrders({ status: parsed.data.status, userId: request.userId as number });

        return response.status(success.code).json(success.data);
    } catch (error) {
        logger().error("Get Orders", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

orderRoutes.get("/:id", verifyToken, async (request: Request, response: Response) => {
    try {
        const parsedParams = idParamSchema.safeParse(request.params);

        if (!parsedParams.success) {
            return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
                message: "Validation Errors",
                ...z.treeifyError(parsedParams.error),
            });
        }

        const [error, success] = await getOrder({
            userId: request.userId as number,
            orderId: parsed.data.id,
        });

        if (error) {
            return response.status(error.code).json({
                message: error.message,
            });
        }

        return response.status(success.code).json(success.data);
    } catch (error) {
        logger().error("Get Order By Id", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

orderRoutes.post("/", verifyToken, async (request: Request, response: Response) => {
    try {
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
    } catch (error) {
        logger().error("Create Order", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

orderRoutes.put("/:id", verifyToken, async (request: Request, response: Response) => {
    try {
        const parsedParams = idParamSchema.safeParse(request.params);

        if (!parsedParams.success) {
            return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
                message: "Validation Errors",
                ...z.treeifyError(parsedParams.error),
            });
        }

        const parsed = updateOrderStatusSchema.safeParse(request.body);

        if (!parsed.success) {
            return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
                message: "Validation Errors",
                ...z.treeifyError(parsed.error),
            });
        }

        const [error, success] = await updateOrderStatus({
            userId: request.userId as number,
            orderId: parseInt(request.params.id),
            status: parsed.data.status,
        });

        if (error) {
            return response.status(error.code).json({
                message: error.message,
            });
        }

        return response.status(success.code).json(success.data);
    } catch (error) {
        logger().error("Update Order Status", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

orderRoutes.delete("/:id", verifyToken, async (request: Request, response: Response) => {
    try {
        const parsedParams = idParamSchema.safeParse(request.params);

        if (!parsedParams.success) {
            return response.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
                message: "Validation Errors",
                ...z.treeifyError(parsedParams.error),
            });
        }

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
    } catch (error) {
        logger().error("Cancel Order", {
            message: (error as Error).message,
        });

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error occurred. Please try again.",
        });
    }
});

export default orderRoutes;
