import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "@/shared/main.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import * as schema from "@/shared/database/schemas/index.ts";
import { db } from "@/shared/database/index.ts";
import { eq } from "drizzle-orm";
import { createSessionToken } from "@/shared/helpers/createSessionToken.ts";
import { orderRepository } from "@/shared/database/repository/orders.ts";

describe("DELETE /orders/:id", () => {
    it("should update the order to cancelled", async () => {
        const [sessionToken, userId] = await createSessionToken();

        const items = [{ name: "Item 01", quantity: 1, price: 10 }];

        const { createOrder } = orderRepository();

        let orderId;

        await db.transaction(async (tx) => {
            const order = {
                customerId: userId as number,
                totalAmount: items.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };

            orderId = (await createOrder(order, items, tx)).order.id;
        });

        const response = await request(app)
            .delete(`/orders/${orderId}`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NO_CONTENT);

        const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));

        assert.strictEqual(order.status, schema.OrderStatus.Cancelled);
    });

    it("should return HTTP 404 if the provider order does not have pending status", async () => {
        const [sessionToken, userId] = await createSessionToken();

        const items = [{ name: "Item 01", quantity: 1, price: 10 }];

        const { createOrder } = orderRepository();

        let orderId;

        await db.transaction(async (tx) => {
            const order = {
                customerId: userId as number,
                totalAmount: items.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };

            const { order: createdOrder } = await createOrder(order, items, tx);

            await tx
                .update(schema.orders)
                .set({
                    status: schema.OrderStatus.Processing,
                })
                .where(eq(schema.orders.id, createdOrder.id));

            orderId = createdOrder.id;
        });

        const response = await request(app)
            .delete(`/orders/${orderId}`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NOT_FOUND);

        assert.strictEqual(response.body.message, "order not found or cannot be cancelled.");
    });

    it("should return HTTP 404 if the provider order does not exists", async () => {
        const [sessionToken] = await createSessionToken();

        const response = await request(app)
            .delete(`/orders/9999`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NOT_FOUND);

        assert.strictEqual(response.body.message, "order not found or cannot be cancelled.");
    });

    it("should return HTTP 404 if the provider order does not belong to the auth user", async () => {
        const [sessionToken] = await createSessionToken();
        const [, anotherUserId] = await createSessionToken();

        const items = [{ name: "Item 01", quantity: 1, price: 10 }];

        const { createOrder } = orderRepository();

        let orderId;

        await db.transaction(async (tx) => {
            const order = {
                customerId: anotherUserId as number,
                totalAmount: items.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };

            orderId = (await createOrder(order, items, tx)).order.id;
        });

        const response = await request(app)
            .delete(`/orders/${orderId}`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NOT_FOUND);

        assert.strictEqual(response.body.message, "order not found or cannot be cancelled.");
    });
});
