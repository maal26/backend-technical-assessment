import { z } from "zod";

export const createOrderRequestSchema = z.object({
    items: z
        .array(
            z.object({
                name: z.string().min(1).max(255),
                quantity: z.number().int().positive(),
                price: z.number().int().nonnegative(),
            })
        )
        .nonempty(),
});

export type CreateOrderInput = z.infer<typeof createOrderRequestSchema>;
