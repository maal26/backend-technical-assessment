import { orderRepository } from "@/shared/database/repository/orders.ts";
import { OrderStatus, type Order } from "@/shared/database/schemas/orders.ts";
import type { User } from "@/shared/database/schemas/users.ts";
import { errorResponse, successResponse } from "@/shared/infra/http/api-response.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";

export async function updateOrderStatus({
    userId,
    orderId,
    status,
}: {
    userId: User["id"];
    orderId: Order["id"];
    status: string;
}) {
    const canTransition = (current: OrderStatus, next: OrderStatus) => {
        const validTransactions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.Pending]: [OrderStatus.Processing, OrderStatus.Cancelled],
            [OrderStatus.Processing]: [OrderStatus.Completed],
            [OrderStatus.Completed]: [],
            [OrderStatus.Cancelled]: [],
        };

        return validTransactions[current].includes(next);
    };

    const { orderByUserId, updateOrderStatusByUserId } = orderRepository();

    const order = await orderByUserId(userId, orderId);

    if (!order) {
        return errorResponse("order not found", STATUS_CODES.NOT_FOUND);
    }

    if (!canTransition(order.status as OrderStatus, status as OrderStatus)) {
        return errorResponse(
            `cannot change order from ${order.status} to ${status}`,
            STATUS_CODES.UNPROCESSABLE_ENTITY
        );
    }

    await updateOrderStatusByUserId(userId, orderId, status);

    return successResponse({}, STATUS_CODES.NO_CONTENT);
}
