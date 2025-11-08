import { type InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.ts';

export const sessions = pgTable("sessions", {
    userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: varchar({ length: 80 }).unique().notNull(),
    createdAt: timestamp("created_at", { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'date' }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
}, (table) => [
    index('sessions_user_id_idx').on(table.userId),
]);

export type Session = InferSelectModel<typeof sessions>;
