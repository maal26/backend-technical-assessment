import { z } from "zod";

import { OrderStatus } from "@/shared/database/schemas/orders.ts";

export const getOrdersRequestSchema = z.object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]).optional(),
});

export type GetOrdersInput = z.infer<typeof getOrdersRequestSchema>;
