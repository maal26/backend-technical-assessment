import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Order, OrderItem } from "../schemas/orders.ts";
import { orders, orderItems } from "../schemas/orders.ts";
import type * as schema from "../schemas/index.ts";

export const orderRepository = () => {
    const createOrder = async (
        order: Pick<Order, "customerId" | "totalAmount" | "status">,
        items: Pick<OrderItem, "name" | "quantity" | "price">[],
        tx: NodePgDatabase<typeof schema>
    ) => {
        const [createdOrder] = await tx.insert(orders).values(order).returning();

        const createdItems = await tx
            .insert(orderItems)
            .values(items.map((item) => ({ ...item, orderId: createdOrder.id })))
            .returning();

        return {
            order: createdOrder,
            items: createdItems,
        };
    };

    return {
        createOrder,
    };
};
