import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "@/shared/main.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import * as schema from "@/shared/database/schemas/index.ts";
import { db } from "@/shared/database/index.ts";
import { eq } from "drizzle-orm";
import { createSessionToken } from "@/shared/helpers/createSessionToken.ts";

describe("POST /orders", () => {
    it("should be possible to create an order as pending", async () => {
        const [sessionToken, userId] = await createSessionToken();

        const items = [
            {
                name: "Beef burger combo",
                quantity: 1,
                price: 3200,
            },
            {
                name: "Iced coffee 500ml",
                quantity: 2,
                price: 1500,
            },
            {
                name: "Chocolate brownie",
                quantity: 3,
                price: 800,
            },
        ];

        const response = await request(app)
            .post("/orders")
            .set("Authorization", sessionToken as string)
            .send({ items });

        assert.strictEqual(response.status, STATUS_CODES.CREATED);

        const [order] = await db
            .select()
            .from(schema.orders)
            .where(eq(schema.orders.customerId, userId as number));

        assert.strictEqual(order.customerId, userId);
        assert.strictEqual(order.totalAmount, 8600);
        assert.strictEqual(order.status, schema.OrderStatus.Pending);

        for (const item of items) {
            const [orderItem] = await db.select().from(schema.orderItems).where(eq(schema.orderItems.name, item.name));

            assert.strictEqual(item.name, orderItem.name);
            assert.strictEqual(item.quantity, orderItem.quantity);
            assert.strictEqual(item.price, orderItem.price);
            assert.strictEqual(order.id, orderItem.orderId);
        }
    });

    it("should should require items", async () => {
        const [sessionToken] = await createSessionToken();

        const response = await request(app)
            .post("/orders")
            .set("Authorization", sessionToken as string)
            .send({ items: [] });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(response.body.properties.items.errors[0], "Too small: expected array to have >=1 items");
    });

    it("should should require items.*.name", async () => {
        const [sessionToken] = await createSessionToken();

        const response = await request(app)
            .post("/orders")
            .set("Authorization", sessionToken as string)
            .send({ items: [{}] });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.items.items[0].properties.name.errors[0],
            "Invalid input: expected string, received undefined"
        );
    });

    it("should should require items.*.price", async () => {
        const [sessionToken] = await createSessionToken();

        const response = await request(app)
            .post("/orders")
            .set("Authorization", sessionToken as string)
            .send({ items: [{}] });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.items.items[0].properties.price.errors[0],
            "Invalid input: expected number, received undefined"
        );
    });

    it("should should require items.*.quantity", async () => {
        const [sessionToken] = await createSessionToken();

        const response = await request(app)
            .post("/orders")
            .set("Authorization", sessionToken as string)
            .send({ items: [{}] });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.items.items[0].properties.quantity.errors[0],
            "Invalid input: expected number, received undefined"
        );
    });
});
