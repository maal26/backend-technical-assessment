import { type InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 255 }).unique().notNull(),
    password: varchar({ length: 60 }).notNull(),
    createdAt: timestamp("created_at", { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'date' }).notNull().defaultNow()
});

export type User = InferSelectModel<typeof users>;