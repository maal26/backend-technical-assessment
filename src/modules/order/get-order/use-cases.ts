import { orderRepository } from "@/shared/database/repository/orders.ts";
import type { Order } from "@/shared/database/schemas/orders.ts";
import type { User } from "@/shared/database/schemas/users.ts";
import { errorResponse, successResponse } from "@/shared/infra/http/api-response.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";

export async function getOrder({ userId, orderId }: { userId: User["id"]; orderId: Order["id"] }) {
    const { orderWithItemsByUserId } = orderRepository();

    const order = await orderWithItemsByUserId(userId, orderId);

    if (!order) {
        return errorResponse("order not found", STATUS_CODES.NOT_FOUND);
    }

    return successResponse(order, STATUS_CODES.OK);
}
