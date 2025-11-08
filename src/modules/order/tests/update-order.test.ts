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

describe("UPDATE /orders/:id", () => {
    it("should be possible to update from pending to processing", async () => {
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
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Processing })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NO_CONTENT);

        const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));

        assert.strict(order.status, schema.OrderStatus.Processing);
    });

    it("should be possible to update from pending to cancelled", async () => {
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
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Cancelled })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NO_CONTENT);

        const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));

        assert.strict(order.status, schema.OrderStatus.Cancelled);
    });

    it("should be possible to update from processing to completed", async () => {
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
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Completed })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NO_CONTENT);

        const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));

        assert.strict(order.status, schema.OrderStatus.Completed);
    });

    it("should not be possible to update from pending to completed", async () => {
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
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Completed })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from pending to completed");
    });

    it("should not be possible to update from processing to cancelled", async () => {
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
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Cancelled })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from processing to cancelled");
    });

    it("should not be possible to update the status once is completed", async () => {
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
                    status: schema.OrderStatus.Completed,
                })
                .where(eq(schema.orders.id, createdOrder.id));

            orderId = createdOrder.id;
        });

        let response = await request(app)
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Pending })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from completed to pending");

        response = await request(app)
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Processing })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from completed to processing");

        response = await request(app)
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Cancelled })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from completed to cancelled");
    });

    it("should not be possible to update the status once is cancelled", async () => {
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
                    status: schema.OrderStatus.Cancelled,
                })
                .where(eq(schema.orders.id, createdOrder.id));

            orderId = createdOrder.id;
        });

        let response = await request(app)
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Pending })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from cancelled to pending");

        response = await request(app)
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Processing })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from cancelled to processing");

        response = await request(app)
            .put(`/orders/${orderId}`)
            .send({ status: schema.OrderStatus.Completed })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(response.body.message, "cannot change order from cancelled to completed");
    });

    it("should return HTTP 404 if the provided id does not exists", async () => {
        const [sessionToken, userId] = await createSessionToken();

        const response = await request(app)
            .put(`/orders/999999`)
            .send({ status: schema.OrderStatus.Pending })
            .set("Authorization", sessionToken as string);

        assert.strictEqual(response.status, STATUS_CODES.NOT_FOUND);
        assert.strictEqual(response.body.message, "order not found");
    });
});
