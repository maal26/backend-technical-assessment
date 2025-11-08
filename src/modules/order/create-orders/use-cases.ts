import type { User } from "@/shared/database/schemas/users.ts";
import { OrderStatus } from "@/shared/database/schemas/orders.ts";
import type { CreateOrderInput } from "./schemas.ts";
import { orderRepository } from "@/shared/database/repository/orders.ts";
import { db } from "@/shared/database/index.ts";
import { errorResponse, successResponse } from "@/shared/infra/http/api-response.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { logger } from "@/shared/config/logger.ts";

export async function createOrder({ items, userId }: CreateOrderInput & { userId: User["id"] }) {
    try {
        const { createOrder } = orderRepository();

        const order = {
            customerId: userId,
            totalAmount: items.reduce((amount, item) => amount + item.price * item.quantity, 0),
            status: OrderStatus.Pending,
        };

        const createdOrder = await db.transaction(async (tx) => {
            return await createOrder(order, items, tx);
        });

        logger().info("Order created successfully", {
            userId,
            orderId: createdOrder.order.id,
            totalAmount: createdOrder.order.totalAmount,
            items: createdOrder.items.length,
        });

        return successResponse(createdOrder, STATUS_CODES.CREATED);
    } catch (error) {
        logger().error("Failed to create order", {
            userId,
            error: (error as Error).message,
        });

        return errorResponse("It was not possible to create your order. Try again", STATUS_CODES.BAD_REQUEST);
    }
}
