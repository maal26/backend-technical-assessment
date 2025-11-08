import { orderRepository } from "@/shared/database/repository/orders.ts";
import type { User } from "@/shared/database/schemas/users.ts";
import { successResponse } from "@/shared/infra/http/api-response.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import type { GetOrdersInput } from "./schemas.ts";

export async function getOrders({ status, userId }: GetOrdersInput & { userId: User["id"] }) {
    const { ordersByUserId } = orderRepository();

    const orders = await ordersByUserId(userId, status);

    return successResponse(orders, STATUS_CODES.OK);
}
