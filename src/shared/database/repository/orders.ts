import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { type User } from "../schemas/users.ts";
import { OrderStatus, type Order, type OrderItem } from "../schemas/orders.ts";
import { orders, orderItems } from "../schemas/orders.ts";
import type * as schema from "../schemas/index.ts";
import { db } from "../index.ts";
import { and, eq, sql } from "drizzle-orm";

export const orderRepository = () => {
    const orderByUserId = async (userId: User["id"], orderId: Order["id"]) => {
        const [order] = await db
            .select({
                id: orders.id,
                status: orders.status,
            })
            .from(orders)
            .where(and(eq(orders.customerId, userId), eq(orders.id, orderId)));

        return order;
    };

    const orderWithItemsByUserId = async (userId: User["id"], orderId: Order["id"]) => {
        return await db.query.orders.findFirst({
            where: (orders, { eq }) => and(eq(orders.customerId, userId), eq(orders.id, orderId)),
            with: {
                items: true,
            },
        });
    };

    const ordersWithItemsByUserId = async (userId: User["id"], status?: string) => {
        return await db.query.orders.findMany({
            where: (orders, { eq }) =>
                and(eq(orders.customerId, userId), status ? eq(orders.status, status) : undefined),
            with: {
                items: true,
            },
        });
    };

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

    const cancelOrderById = async (userId: User["id"], orderId: Order["id"]) => {
        const result = await db
            .update(orders)
            .set({
                status: OrderStatus["Cancelled"],
                updatedAt: sql`NOW()`,
            })
            .where(
                and(eq(orders.customerId, userId), eq(orders.id, orderId), eq(orders.status, OrderStatus["Pending"]))
            );

        return result.rowCount;
    };

    const updateOrderStatusByUserId = async (userId: User["id"], orderId: Order["id"], status: string) => {
        await db
            .update(orders)
            .set({
                status,
                updatedAt: sql`NOW()`,
            })
            .where(and(eq(orders.customerId, userId), eq(orders.id, orderId)));
    };

    return {
        orderByUserId,
        createOrder,
        orderWithItemsByUserId,
        ordersWithItemsByUserId,
        cancelOrderById,
        updateOrderStatusByUserId,
    };
};
