import { logger } from "@/shared/config/logger.ts";
import { orderRepository } from "@/shared/database/repository/orders.ts";
import type { Order } from "@/shared/database/schemas/orders.ts";
import type { User } from "@/shared/database/schemas/users.ts";
import { errorResponse, successResponse } from "@/shared/infra/http/api-response.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";

export async function deleteOrder({ userId, orderId }: { userId: User["id"]; orderId: Order["id"] }) {
    const { cancelOrderById } = orderRepository();

    const updatedRows = await cancelOrderById(userId, orderId);

    if (!updatedRows || updatedRows < 1) {
        logger().warn("Order not found or cannot be cancelled", { userId, orderId });

        return errorResponse("order not found or cannot be cancelled.", STATUS_CODES.NOT_FOUND);
    }

    logger().info("Order cancelled successfully", { userId, orderId });

    return successResponse({}, STATUS_CODES.NO_CONTENT);
}
