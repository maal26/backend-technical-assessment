import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "@/shared/main.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import * as schema from "@/shared/database/schemas/index.ts";
import { db } from "@/shared/database/index.ts";
import { createSessionToken } from "@/shared/helpers/createSessionToken.ts";
import { orderRepository } from "@/shared/database/repository/orders.ts";
import { eq } from "drizzle-orm";

describe("GET /orders", () => {
    it("should return orders from auth user", async () => {
        const [authUserSessionToken, authUserId] = await createSessionToken();
        const [, anotherUserId] = await createSessionToken();

        const authUserItems = [
            { name: "Item 01", quantity: 1, price: 10 },
            { name: "Item 02", quantity: 2, price: 1500 },
            { name: "Item 03", quantity: 3, price: 800 },
        ];

        const anotherUserItems = [
            { name: "Item 01", quantity: 1, price: 10 },
            { name: "Item 02", quantity: 2, price: 1500 },
        ];

        const { createOrder } = orderRepository();

        await db.transaction(async (tx) => {
            const authUserOrder = {
                customerId: authUserId as number,
                totalAmount: authUserItems.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };

            await createOrder(authUserOrder, authUserItems, tx);

            const anotherUserOrder = {
                customerId: anotherUserId as number,
                totalAmount: anotherUserItems.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };

            await createOrder(anotherUserOrder, anotherUserItems, tx);
        });

        const response = await request(app)
            .get("/orders")
            .set("Authorization", authUserSessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.strictEqual(response.body[0].customerId, authUserId);
        assert.strictEqual(response.body[0].items.length, 3);
    });

    it("should be possible to filter orders by status", async () => {
        const [sessionToken, userId] = await createSessionToken();

        const items01 = [{ name: "Item 01", quantity: 1, price: 10 }];

        const items02 = [{ name: "Item 01", quantity: 1, price: 10 }];

        const { createOrder } = orderRepository();

        await db.transaction(async (tx) => {
            const order01 = {
                customerId: userId as number,
                totalAmount: items01.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };
            const order02 = {
                customerId: userId as number,
                totalAmount: items02.reduce((amount, item) => amount + item.price * item.quantity, 0),
                status: schema.OrderStatus.Pending,
            };

            await createOrder(order01, items01, tx);
            const { order } = await createOrder(order02, items02, tx);

            await tx
                .update(schema.orders)
                .set({ status: schema.OrderStatus.Completed })
                .where(eq(schema.orders.id, order.id));
        });

        let response = await request(app)
            .get("/orders")
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.strictEqual(response.body.length, 2);

        response = await request(app)
            .get("/orders?status=pending")
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.strictEqual(response.body.length, 1);

        response = await request(app)
            .get("/orders?status=completed")
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.strictEqual(response.body.length, 1);

        response = await request(app)
            .get("/orders?status=processing")
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.strictEqual(response.body.length, 0);
    });
});
