import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "@/shared/main.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import * as schema from "@/shared/database/schemas/index.ts";
import { db } from "@/shared/database/index.ts";
import { createSessionToken } from "@/shared/helpers/createSessionToken.ts";
import { orderRepository } from "@/shared/database/repository/orders.ts";

describe("GET /orders/:id", () => {
    it("should return the provided order successfully", async () => {
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
            .get(`/orders/${orderId}`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.strictEqual(response.body.id, orderId);
    });

    it("should return HTTP 404 if the order does not exists", async () => {
        const [sessionToken] = await createSessionToken();

        const response = await request(app)
            .get(`/orders/9999999`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NOT_FOUND);
    });

    it("should return HTTP 404 if the order does not belong to the auth user", async () => {
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
            .get(`/orders/${orderId}`)
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NOT_FOUND);
    });
});
