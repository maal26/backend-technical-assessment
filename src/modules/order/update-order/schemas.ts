import { z } from "zod";

import { OrderStatus } from "@/shared/database/schemas/orders.ts";

export const updateOrderStatusSchema = z.object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
