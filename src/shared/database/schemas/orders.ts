import { pgTable, integer, varchar, timestamp, check } from "drizzle-orm/pg-core";
import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { users } from "./users.ts";

export const OrderStatus = {
    Pending: "pending",
    Processing: "processing",
    Completed: "completed",
    Cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const orders = pgTable(
    "orders",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        customerId: integer("customer_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        totalAmount: integer("total_amount").notNull(),
        status: varchar("status", { length: 20 }).notNull().default("pending"),
        createdAt: timestamp("created_at", { withTimezone: false, mode: "date" }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: false, mode: "date" }).notNull().defaultNow(),
    },
    (table) => [check("orders_total_amount_non_negative", sql`${table.totalAmount} >= 0`)]
);

export const orderItems = pgTable(
    "order_items",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        orderId: integer("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        quantity: integer("quantity").notNull(),
        price: integer("price").notNull(),
        createdAt: timestamp("created_at", { withTimezone: false, mode: "date" }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: false, mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        check("order_items_quantity_positive", sql`${table.quantity} > 0`),
        check("order_items_price_non_negative", sql`${table.price} >= 0`),
    ]
);

export type Order = InferSelectModel<typeof orders>;

export type OrderItem = InferSelectModel<typeof orderItems>;

export const orderRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
}));
